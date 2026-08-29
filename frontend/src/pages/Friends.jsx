import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { auth, db } from "../firebase";

import "./Friends.css";


function Friends() {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);


  // -----------------------------------------
  // LOAD FRIENDS FROM FIREBASE
  // -----------------------------------------

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (!user) {
          navigate("/login");
          return;
        }

        try {
          const currentUserRef = doc(
            db,
            "users",
            user.uid
          );

          const currentUserSnapshot =
            await getDoc(currentUserRef);

          if (!currentUserSnapshot.exists()) {
            setFriends([]);
            return;
          }

          const currentUserData =
            currentUserSnapshot.data();

          const friendIds =
            currentUserData.friends || [];

          if (friendIds.length === 0) {
            setFriends([]);
            return;
          }


          // Load each friend's profile

          const friendProfiles =
            await Promise.all(
              friendIds.map(async (friendId) => {
                const friendRef = doc(
                  db,
                  "users",
                  friendId
                );

                const friendSnapshot =
                  await getDoc(friendRef);

                if (!friendSnapshot.exists()) {
                  return null;
                }

                return {
                  id: friendSnapshot.id,
                  ...friendSnapshot.data(),
                };
              })
            );


          // Remove deleted / invalid users

          setFriends(
            friendProfiles.filter(Boolean)
          );

        } catch (error) {
          console.error(
            "Error loading friends:",
            error
          );

          setFriends([]);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);


  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  const filteredFriends = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return friends;
    }

    return friends.filter((friend) => {

      const nameMatch =
        (friend.name || "")
          .toLowerCase()
          .includes(query);


      const degreeMatch =
        (friend.degree || "")
          .toLowerCase()
          .includes(query);


      const interestMatch =
        (friend.interests || []).some(
          (interest) =>
            interest
              .toLowerCase()
              .includes(query)
        );


      return (
        nameMatch ||
        degreeMatch ||
        interestMatch
      );
    });

  }, [friends, search]);


  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <main className="friends-page">
        <section className="friends-shell">
          <p>Loading friends...</p>
        </section>
      </main>
    );
  }


  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <main className="friends-page">

      <div className="friends-background friends-background-one" />
      <div className="friends-background friends-background-two" />


      <section className="friends-shell">

        {/* HEADER */}

        <header className="friends-header">

          <div>

            <p className="friends-eyebrow">
              CHUM BUDDIES
            </p>

            <h1>
              Friends
            </h1>

            <p className="friends-subtitle">
              Your university chums,
              all in one place.
            </p>

          </div>


          <div className="friends-count">

            <strong>
              {friends.length}
            </strong>

            <span>
              chums
            </span>

          </div>

        </header>


        {/* SEARCH */}

        <div className="friends-search">

          <span className="friends-search-icon">
            ⌕
          </span>

          <input
            type="search"
            placeholder="Search your friends..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search friends"
          />


          {search && (
            <button
              className="friends-search-clear"
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>


        {/* FRIEND LIST */}

        <div className="friends-list">

          {filteredFriends.length > 0 ? (

            filteredFriends.map(
              (friend) => (

                <article
                  className="friend-card"
                  key={friend.id}
                >

                  <button
                    className="friend-card-main"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/users/${friend.id}`
                      )
                    }
                  >

                    {/* AVATAR */}

                    <div className="friend-avatar">

                      {friend.profilePicture ? (
                        <img
                          src={
                            friend.profilePicture
                          }
                          alt={
                            `${friend.name}'s profile`
                          }
                        />
                      ) : (
                        friend.name
                          ? friend.name
                              .charAt(0)
                              .toUpperCase()
                          : "?"
                      )}

                    </div>


                    {/* INFORMATION */}

                    <div className="friend-information">

                      <h2>
                        {friend.name ||
                          "USYD Student"}
                      </h2>


                      {friend.degree && (
                        <p className="friend-degree">
                          {friend.degree}
                        </p>
                      )}


                      <div className="friend-interests">

                        {(friend.interests || [])
                          .slice(0, 3)
                          .map((interest) => (
                            <span key={interest}>
                              {interest}
                            </span>
                          ))}

                      </div>

                    </div>


                    <span className="friend-arrow">
                      ›
                    </span>

                  </button>

                </article>

              )
            )

          ) : (

            <div className="friends-empty">

              <div className="friends-empty-icon">
                ⌕
              </div>

              <h2>
                No chums found
              </h2>

              <p>
                {friends.length === 0
                  ? "You haven't added any friends yet."
                  : "Try searching for a different name, degree, or interest."}
              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}


export default Friends;