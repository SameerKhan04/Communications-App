import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "./Friends.css";

// Temporary data for UI development only.
// This can later be replaced with Firebase/database data.
const MOCK_FRIENDS = [
  {
    id: "1",
    name: "Sarah",
    degree: "Computer Science",
    interests: ["Gaming", "Technology", "Movies"],
    avatar: "S",
  },
  {
    id: "2",
    name: "Matthew",
    degree: "Law",
    interests: ["Music", "Sport", "Travel"],
    avatar: "M",
  },
  {
    id: "3",
    name: "Isaac",
    degree: "Software Engineering",
    interests: ["Technology", "Music", "Gaming"],
    avatar: "I",
  },
  {
    id: "4",
    name: "Nayoung",
    degree: "Arts",
    interests: ["Art & Design", "Anime", "Photography"],
    avatar: "N",
  },
];

function Friends({ friends = MOCK_FRIENDS }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredFriends = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return friends;
    }

    return friends.filter((friend) => {
      const nameMatch = friend.name
        .toLowerCase()
        .includes(query);

      const degreeMatch = friend.degree
        .toLowerCase()
        .includes(query);

      const interestMatch = friend.interests.some(
        (interest) =>
          interest.toLowerCase().includes(query),
      );

      return (
        nameMatch ||
        degreeMatch ||
        interestMatch
      );
    });
  }, [friends, search]);

  return (
    <main className="friends-page">
      <div className="friends-background friends-background-one" />
      <div className="friends-background friends-background-two" />

      <section className="friends-shell">
        <header className="friends-header">
          <div>
            <p className="friends-eyebrow">
              CHUM BUDDY
            </p>

            <h1>Friends</h1>

            <p className="friends-subtitle">
              Your university chums, all in one place.
            </p>
          </div>

          <div className="friends-count">
            <strong>{friends.length}</strong>
            <span>chums</span>
          </div>
        </header>

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
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="friends-list">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <article
                className="friend-card"
                key={friend.id}
              >
                <button
                  className="friend-card-main"
                  type="button"
                  onClick={() =>
                    navigate(`/users/${friend.id}`)
                  }
                >
                  <div className="friend-avatar">
                    {friend.avatar}
                  </div>

                  <div className="friend-information">
                    <h2>{friend.name}</h2>

                    <p className="friend-degree">
                      {friend.degree}
                    </p>

                    <div className="friend-interests">
                      {friend.interests
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
            ))
          ) : (
            <div className="friends-empty">
              <div className="friends-empty-icon">
                ⌕
              </div>

              <h2>No chums found</h2>

              <p>
                Try searching for a different name,
                degree, or interest.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Friends;