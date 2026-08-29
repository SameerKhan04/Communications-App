import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  auth,
  db,
} from "../firebase";

import "./Messages.css";


function MessagesPage() {
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [friendEmail, setFriendEmail] =
    useState("");

  const [modalError, setModalError] =
    useState("");

  const [addingFriend, setAddingFriend] =
    useState(false);


  // -----------------------------------------
  // AUTH + LIVE CHAT LIST
  // -----------------------------------------

  useEffect(() => {
    let unsubscribeChats = null;

    const unsubscribeAuth =
      auth.onAuthStateChanged(
        async (user) => {
          if (!user) {
            navigate("/login");
            return;
          }


          // Load friends

          await loadFriends(user.uid);


          // Listen for chats involving current user

          const chatsQuery = query(
            collection(db, "chats"),
            where(
              "participants",
              "array-contains",
              user.uid
            )
          );


          unsubscribeChats = onSnapshot(
            chatsQuery,
            async (snapshot) => {
              try {
                const loadedChats =
                  await Promise.all(
                    snapshot.docs.map(
                      async (chatDoc) => {
                        const chatData =
                          chatDoc.data();

                        const participants =
                          chatData.participants || [];


                        const otherUserId =
                          participants.find(
                            (participantId) =>
                              participantId !==
                              user.uid
                          );


                        let otherUser = null;


                        if (otherUserId) {
                          const userSnapshot =
                            await getDoc(
                              doc(
                                db,
                                "users",
                                otherUserId
                              )
                            );


                          if (
                            userSnapshot.exists()
                          ) {
                            otherUser = {
                              id:
                                userSnapshot.id,
                              ...userSnapshot.data(),
                            };
                          }
                        }


                        return {
                          id: chatDoc.id,
                          ...chatData,
                          otherUser,
                        };
                      }
                    )
                  );


                // Newest chats first

                loadedChats.sort(
                  (a, b) => {
                    const timeA =
                      a.updatedAt
                        ?.toMillis?.() || 0;

                    const timeB =
                      b.updatedAt
                        ?.toMillis?.() || 0;

                    return timeB - timeA;
                  }
                );


                setChats(loadedChats);

              } catch (error) {
                console.error(
                  "Error loading chats:",
                  error
                );
              }
            },
            (error) => {
              console.error(
                "Chat listener error:",
                error
              );
            }
          );
        }
      );


    return () => {
      unsubscribeAuth();

      if (unsubscribeChats) {
        unsubscribeChats();
      }
    };

  }, [navigate]);


  // -----------------------------------------
  // LOAD FRIENDS
  // -----------------------------------------

  async function loadFriends(uid) {
    try {
      const currentUserSnapshot =
        await getDoc(
          doc(
            db,
            "users",
            uid
          )
        );


      if (!currentUserSnapshot.exists()) {
        setFriends([]);
        return;
      }


      const friendIds =
        currentUserSnapshot.data()
          .friends || [];


      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }


      const friendProfiles =
        await Promise.all(
          friendIds.map(
            async (friendId) => {
              const friendSnapshot =
                await getDoc(
                  doc(
                    db,
                    "users",
                    friendId
                  )
                );


              if (!friendSnapshot.exists()) {
                return null;
              }


              return {
                id: friendSnapshot.id,
                ...friendSnapshot.data(),
              };
            }
          )
        );


      setFriends(
        friendProfiles.filter(Boolean)
      );

    } catch (error) {
      console.error(
        "Error loading friends:",
        error
      );

      setFriends([]);
    }
  }


  // -----------------------------------------
  // ADD MUTUAL FRIEND
  // -----------------------------------------

  async function handleAddFriend(event) {
    event.preventDefault();

    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      return;
    }


    const cleanedEmail =
      friendEmail
        .trim()
        .toLowerCase();


    if (!cleanedEmail) {
      return;
    }


    setModalError("");


    if (
      cleanedEmail ===
      currentUser.email
        ?.toLowerCase()
    ) {
      setModalError(
        "You can't add yourself."
      );

      return;
    }


    setAddingFriend(true);


    try {
      // Find user by email

      const usersQuery = query(
        collection(db, "users"),
        where(
          "email",
          "==",
          cleanedEmail
        )
      );


      const snapshot =
        await getDocs(usersQuery);


      if (snapshot.empty) {
        setModalError(
          "No user found with that email."
        );

        return;
      }


      const newFriendDocument =
        snapshot.docs[0];


      const newFriendId =
        newFriendDocument.id;


      // Check existing friendship

      const alreadyFriends =
        friends.some(
          (friend) =>
            friend.id === newFriendId
        );


      if (alreadyFriends) {
        setModalError(
          "This person is already in your friends list."
        );

        return;
      }


      // -----------------------------------------
      // MUTUAL FRIENDSHIP
      // -----------------------------------------

      const batch =
        writeBatch(db);


      const currentUserRef =
        doc(
          db,
          "users",
          currentUser.uid
        );


      const newFriendRef =
        doc(
          db,
          "users",
          newFriendId
        );


      // Add friend to current user

      batch.update(
        currentUserRef,
        {
          friends:
            arrayUnion(
              newFriendId
            ),
        }
      );


      // Add current user to friend

      batch.update(
        newFriendRef,
        {
          friends:
            arrayUnion(
              currentUser.uid
            ),
        }
      );


      await batch.commit();


      setFriendEmail("");


      await loadFriends(
        currentUser.uid
      );

    } catch (error) {
      console.error(
        "Error adding friend:",
        error
      );

      setModalError(
        "Something went wrong while adding this friend."
      );

    } finally {
      setAddingFriend(false);
    }
  }


  // -----------------------------------------
  // START / OPEN CHAT
  // -----------------------------------------

  async function startChat(friendId) {
    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      return;
    }


    try {
      // Check loaded chats first

      const existingChat =
        chats.find((chat) => {
          const participants =
            chat.participants || [];


          return (
            participants.includes(
              currentUser.uid
            ) &&
            participants.includes(
              friendId
            )
          );
        });


      if (existingChat) {
        navigate(
          `/messages/${existingChat.id}`
        );

        return;
      }


      // Create conversation

      const newChat =
        await addDoc(
          collection(
            db,
            "chats"
          ),
          {
            participants: [
              currentUser.uid,
              friendId,
            ],

            lastMessage:
              "Say hi!",

            updatedAt:
              serverTimestamp(),
          }
        );


      navigate(
        `/messages/${newChat.id}`
      );

    } catch (error) {
      console.error(
        "Error starting chat:",
        error
      );
    }
  }


  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <main className="messages-page">

      <div className="messages-container">

        {/* HEADER */}

        <div className="messages-header">

          <h1>
            Messages
          </h1>


          <button
            type="button"
            className="new-chat-button"
            onClick={() => {
              setModalError("");
              setFriendEmail("");
              setIsModalOpen(true);
            }}
          >
            + New Chat
          </button>

        </div>


        {/* CHAT LIST */}

        <div className="chat-list">

          {chats.length === 0 ? (

            <p className="empty-state">
              No messages yet.
              Start a chat!
            </p>

          ) : (

            chats.map((chat) => {

              const otherUser =
                chat.otherUser;


              const displayName =
                otherUser?.name ||
                "USYD Student";


              const initial =
                displayName
                  .charAt(0)
                  .toUpperCase();


              return (
                <div
                  key={chat.id}
                  className="chat-row"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(
                      `/messages/${chat.id}`
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      navigate(
                        `/messages/${chat.id}`
                      );
                    }
                  }}
                >

                  {/* AVATAR */}

                  <div className="chat-row-avatar">

                    {otherUser
                      ?.profilePicture ? (

                      <img
                        src={
                          otherUser
                            .profilePicture
                        }
                        alt={
                          `${displayName}'s profile`
                        }
                      />

                    ) : (

                      <span>
                        {initial}
                      </span>

                    )}

                  </div>


                  {/* DETAILS */}

                  <div className="chat-row-details">

                    <strong>
                      {displayName}
                    </strong>

                    <p>
                      {chat.lastMessage ||
                        "Start a conversation"}
                    </p>

                  </div>

                </div>
              );
            })

          )}

        </div>

      </div>


      {/* =========================
          NEW CHAT MODAL
          ========================= */}

      {isModalOpen && (

        <div
          className="modal-overlay"
          onClick={() =>
            setIsModalOpen(false)
          }
        >

          <div
            className="modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <h2>
              Start a Chat
            </h2>


            {/* ADD FRIEND */}

            <form
              className="add-friend-form"
              onSubmit={handleAddFriend}
            >

              <input
                type="email"
                placeholder="Add friend by university email..."
                value={friendEmail}
                onChange={(event) => {
                  setFriendEmail(
                    event.target.value
                  );

                  setModalError("");
                }}
                required
              />


              <button
                type="submit"
                disabled={addingFriend}
              >
                {addingFriend
                  ? "Adding..."
                  : "Add"}
              </button>

            </form>


            {modalError && (
              <p className="error-message">
                {modalError}
              </p>
            )}


            {/* FRIEND LIST */}

            <div className="friends-list">

              <h3>
                Your Friends
              </h3>


              {friends.length === 0 ? (

                <p className="empty-state">
                  Add a friend above
                  to start chatting.
                </p>

              ) : (

                friends.map(
                  (friend) => (

                    <div
                      key={friend.id}
                      className="friend-row"
                    >

                      <span>
                        {friend.name ||
                          "USYD Student"}
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          startChat(
                            friend.id
                          )
                        }
                      >
                        Chat
                      </button>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


export default MessagesPage;