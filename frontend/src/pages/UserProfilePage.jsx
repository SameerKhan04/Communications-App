import { useNavigate, useParams } from "react-router";

import "./ProfilePage.css";

const MOCK_USERS = {
  u1: {
    id: "u1",
    name: "Sameer",
    pronouns: "he/him",
    bio: "Software engineering student who likes tech and meeting new people.",
    degree: "Software Engineering",
    major: "",
    second_major_minor: "",
    languages: ["English", "Urdu"],
    interests: ["Coding", "Gaming"],
    societies: ["CSESoc", "SUAnime"],
    profilePicture: null,
  },

  u5: {
    id: "u5",
    name: "Hannah",
    pronouns: "she/her",
    bio: "Engineering student interested in gaming and technology.",
    degree: "Software Engineering",
    major: "",
    second_major_minor: "",
    languages: ["English", "Mandarin"],
    interests: ["Gaming", "Coding"],
    societies: ["CSESoc", "GamingSoc"],
    profilePicture: null,
  },
};

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const profile = MOCK_USERS[userId];

  if (!profile) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-container">
          <p>User not found.</p>
        </div>
      </main>
    );
  }

  function handleMessage() {
    // Later this should open/create a conversation
    // with this specific user.
    navigate(`/chat/${profile.id}`);
  }

  return (
    <main className="public-profile-page">
      <header className="public-profile-navbar">
        <div className="public-profile-logo">
          <span>CHUM</span>
          <strong>BUCKET</strong>
        </div>

        <span>Profile</span>
      </header>

      <div className="public-profile-container">
        <section className="public-profile-card">
          <div className="public-profile-top">
            <div className="public-profile-picture">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={`${profile.name}'s profile`}
                />
              ) : (
                <span>
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="public-profile-identity">
              <p className="public-profile-eyebrow">
                STUDENT PROFILE
              </p>

              <h1>{profile.name}</h1>

              {profile.pronouns && (
                <p className="public-profile-pronouns">
                  {profile.pronouns}
                </p>
              )}

              {profile.bio && (
                <p className="public-profile-bio">
                  {profile.bio}
                </p>
              )}
            </div>

            <button
              type="button"
              className="public-message-button"
              onClick={handleMessage}
            >
              Message
            </button>
          </div>

          {(profile.degree ||
            profile.major ||
            profile.second_major_minor) && (
            <section className="public-profile-section">
              <h2>Study</h2>

              <div className="public-study-details">
                {profile.degree && (
                  <div>
                    <span>Degree</span>
                    <strong>{profile.degree}</strong>
                  </div>
                )}

                {profile.major && (
                  <div>
                    <span>Major</span>
                    <strong>{profile.major}</strong>
                  </div>
                )}

                {profile.second_major_minor && (
                  <div>
                    <span>Second major / minor</span>
                    <strong>
                      {profile.second_major_minor}
                    </strong>
                  </div>
                )}
              </div>
            </section>
          )}

          <ProfileTags
            title="Languages"
            items={profile.languages}
          />

          <ProfileTags
            title="Interests"
            items={profile.interests}
            highlight
          />

          <ProfileTags
            title="Societies"
            items={profile.societies}
            highlight
          />
        </section>
      </div>
    </main>
  );
}

function ProfileTags({
  title,
  items = [],
  highlight = false,
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="public-profile-section">
      <h2>{title}</h2>

      <div className="public-profile-tags">
        {items.map((item) => (
          <span
            key={item}
            className={
              highlight
                ? "public-profile-tag highlighted"
                : "public-profile-tag"
            }
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export default UserProfilePage;