import { useState } from "react";
import { useNavigate } from "react-router";

import "./EditProfilePage.css";

const PREMADE_INTERESTS = [
  "Anime",
  "Art",
  "Basketball",
  "Books",
  "Coding",
  "Design",
  "Film",
  "Food",
  "Gaming",
  "Gym",
  "Music",
  "Photography",
  "Running",
  "Startups",
  "Travel",
];

const PREMADE_LANGUAGES = [
  "English",
  "Mandarin",
  "Cantonese",
  "Korean",
  "Japanese",
  "Arabic",
  "Hindi",
  "Spanish",
  "French",
  "Urdu",
];

const PREMADE_SOCIETIES = [
  "SYNCS",
  "DataSoc",
  "PMSoc",
  "BoulderSoc",
  "ChairSoc",
];

const DEFAULT_PROFILE = {
  name: "Nayoung",
  pronouns: "",
  bio: "",
  degree: "",
  major: "",
  second_major_minor: "",
  languages: ["English"],
  interests: ["Anime", "Photography"],
  societies: [],
  profilePicture: null,
};

function EditProfilePage() {
  const navigate = useNavigate();

  /*
    Load previously saved profile information.

    Later this can be replaced by data coming
    from your backend/database.
  */
  const savedProfileString = localStorage.getItem(
    "chumBuddyProfile",
  );

  let savedProfile = DEFAULT_PROFILE;

  if (savedProfileString) {
    try {
      savedProfile = {
        ...DEFAULT_PROFILE,
        ...JSON.parse(savedProfileString),
      };
    } catch (error) {
      console.error(
        "Could not read saved profile:",
        error,
      );
    }
  }

  const [profilePicture, setProfilePicture] = useState(
    savedProfile.profilePicture,
  );

  const [name, setName] = useState(
    savedProfile.name,
  );

  const [pronouns, setPronouns] = useState(
    savedProfile.pronouns,
  );

  const [bio, setBio] = useState(
    savedProfile.bio,
  );

  const [degree, setDegree] = useState(
    savedProfile.degree,
  );

  const [major, setMajor] = useState(
    savedProfile.major,
  );

  const [secondMajorMinor, setSecondMajorMinor] =
    useState(savedProfile.second_major_minor);

  const [languages, setLanguages] = useState(
    savedProfile.languages ?? [],
  );

  const [customLanguage, setCustomLanguage] =
    useState("");

  const [interests, setInterests] = useState(
    savedProfile.interests ?? [],
  );

  const [customInterest, setCustomInterest] =
    useState("");

  const [societies, setSocieties] = useState(
    savedProfile.societies ?? [],
  );

  const [customSociety, setCustomSociety] =
    useState("");

  function handlePictureChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfilePicture(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function toggleLanguage(language) {
    if (languages.includes(language)) {
      setLanguages(
        languages.filter(
          (selectedLanguage) =>
            selectedLanguage !== language,
        ),
      );

      return;
    }

    setLanguages([
      ...languages,
      language,
    ]);
  }

  function addCustomLanguage() {
    const cleanedLanguage =
      customLanguage.trim();

    if (!cleanedLanguage) {
      return;
    }

    const alreadyExists = languages.some(
      (language) =>
        language.toLowerCase() ===
        cleanedLanguage.toLowerCase(),
    );

    if (!alreadyExists) {
      setLanguages([
        ...languages,
        cleanedLanguage,
      ]);
    }

    setCustomLanguage("");
  }

  function toggleInterest(interest) {
    if (interests.includes(interest)) {
      setInterests(
        interests.filter(
          (selectedInterest) =>
            selectedInterest !== interest,
        ),
      );

      return;
    }

    setInterests([
      ...interests,
      interest,
    ]);
  }

  function addCustomInterest() {
    const cleanedInterest =
      customInterest.trim();

    if (!cleanedInterest) {
      return;
    }

    const alreadyExists = interests.some(
      (interest) =>
        interest.toLowerCase() ===
        cleanedInterest.toLowerCase(),
    );

    if (!alreadyExists) {
      setInterests([
        ...interests,
        cleanedInterest,
      ]);
    }

    setCustomInterest("");
  }

  function removeInterest(interest) {
    setInterests(
      interests.filter(
        (selectedInterest) =>
          selectedInterest !== interest,
      ),
    );
  }

  function toggleSociety(society) {
    if (societies.includes(society)) {
      setSocieties(
        societies.filter(
          (selectedSociety) =>
            selectedSociety !== society,
        ),
      );

      return;
    }

    setSocieties([
      ...societies,
      society,
    ]);
  }

  function addCustomSociety() {
    const cleanedSociety =
      customSociety.trim();

    if (!cleanedSociety) {
      return;
    }

    const alreadyExists = societies.some(
      (society) =>
        society.toLowerCase() ===
        cleanedSociety.toLowerCase(),
    );

    if (!alreadyExists) {
      setSocieties([
        ...societies,
        cleanedSociety,
      ]);
    }

    setCustomSociety("");
  }

  function removeSociety(society) {
    setSocieties(
      societies.filter(
        (selectedSociety) =>
          selectedSociety !== society,
      ),
    );
  }

  function handleSave(event) {
    event.preventDefault();

    const profile = {
      name,
      pronouns,
      bio,
      degree,
      major,
      second_major_minor: secondMajorMinor,
      languages,
      interests,
      societies,
      profilePicture,
    };

    /*
      Temporary frontend storage.

      Later this should become an API request
      to your backend/database.
    */
    localStorage.setItem(
      "chumBuddyProfile",
      JSON.stringify(profile),
    );

    /*
      After saving, return to the normal
      read-only owner profile page.
    */
    navigate("/profile");
  }

  function handleCancel() {
    navigate("/profile");
  }

  return (
    <main className="profile-page">
      <header className="profile-navbar">
        <div className="profile-logo">
          <span>CHUM</span>
          <strong>BUDDY</strong>
        </div>

        <span className="profile-nav-title">
          Edit Profile
        </span>
      </header>

      <div className="profile-container">
        <section className="profile-heading">
          <p className="profile-eyebrow">
            EDIT YOUR PROFILE
          </p>

          <h1>Tell people who you are.</h1>

          <p>
            Update how you appear to other students
            on Chum Buddy.
          </p>
        </section>

        <form
          className="profile-form"
          onSubmit={handleSave}
        >
          {/* PROFILE PICTURE */}

          <section className="profile-form-card profile-picture-section">
            <div className="profile-picture-preview">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile preview"
                />
              ) : (
                <span>
                  {name
                    ? name
                        .charAt(0)
                        .toUpperCase()
                    : "?"}
                </span>
              )}
            </div>

            <div className="profile-picture-copy">
              <h2>Profile picture</h2>

              <p>
                Add a photo so people can recognise
                you.
              </p>

              <label className="profile-upload-button">
                Upload photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePictureChange
                  }
                />
              </label>
            </div>
          </section>

          {/* ABOUT */}

          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>01</span>

              <div>
                <h2>About you</h2>

                <p>
                  The basics people will see on your
                  profile.
                </p>
              </div>
            </div>

            <div className="profile-two-columns">
              <div className="profile-form-group">
                <label htmlFor="profile-name">
                  Name or nickname
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  placeholder="What should we call you?"
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-pronouns">
                  Pronouns
                </label>

                <input
                  id="profile-pronouns"
                  type="text"
                  value={pronouns}
                  placeholder="e.g. she/her"
                  onChange={(event) =>
                    setPronouns(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-bio">
                Bio
              </label>

              <textarea
                id="profile-bio"
                value={bio}
                maxLength={250}
                placeholder="Tell people a little about yourself..."
                onChange={(event) =>
                  setBio(
                    event.target.value,
                  )
                }
              />

              <span className="profile-character-count">
                {bio.length}/250
              </span>
            </div>
          </section>

          {/* STUDY */}

          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>02</span>

              <div>
                <h2>Study</h2>

                <p>
                  Optional — share what you're
                  studying.
                </p>
              </div>
            </div>

            <div className="profile-two-columns">
              <div className="profile-form-group">
                <label htmlFor="profile-degree">
                  Degree

                  <span className="profile-optional">
                    Optional
                  </span>
                </label>

                <input
                  id="profile-degree"
                  type="text"
                  value={degree}
                  placeholder="e.g. Bachelor of Arts"
                  onChange={(event) =>
                    setDegree(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-major">
                  Major

                  <span className="profile-optional">
                    Optional
                  </span>
                </label>

                <input
                  id="profile-major"
                  type="text"
                  value={major}
                  placeholder="e.g. Media Studies"
                  onChange={(event) =>
                    setMajor(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-second-major">
                Second major / minor

                <span className="profile-optional">
                  Optional
                </span>
              </label>

              <input
                id="profile-second-major"
                type="text"
                value={secondMajorMinor}
                placeholder="e.g. Computer Science minor"
                onChange={(event) =>
                  setSecondMajorMinor(
                    event.target.value,
                  )
                }
              />
            </div>
          </section>

          {/* LANGUAGES */}

          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>03</span>

              <div>
                <h2>Languages</h2>

                <p>
                  Select the languages you're
                  comfortable communicating in.
                </p>
              </div>
            </div>

            <div className="profile-option-grid">
              {PREMADE_LANGUAGES.map(
                (language) => (
                  <button
                    key={language}
                    type="button"
                    className={
                      languages.includes(
                        language,
                      )
                        ? "profile-option-chip selected"
                        : "profile-option-chip"
                    }
                    onClick={() =>
                      toggleLanguage(
                        language,
                      )
                    }
                  >
                    {language}
                  </button>
                ),
              )}
            </div>

            <div className="profile-custom-option">
              <input
                type="text"
                value={customLanguage}
                placeholder="Add another language"
                onChange={(event) =>
                  setCustomLanguage(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    event.preventDefault();
                    addCustomLanguage();
                  }
                }}
              />

              <button
                type="button"
                onClick={addCustomLanguage}
              >
                Add
              </button>
            </div>
          </section>

          {/* INTERESTS */}

          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>04</span>

              <div>
                <h2>Interests</h2>

                <p>
                  Pick anything you're into or add
                  your own.
                </p>
              </div>
            </div>

            <div className="profile-option-grid">
              {PREMADE_INTERESTS.map(
                (interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={
                      interests.includes(
                        interest,
                      )
                        ? "profile-option-chip selected"
                        : "profile-option-chip"
                    }
                    onClick={() =>
                      toggleInterest(
                        interest,
                      )
                    }
                  >
                    {interest}
                  </button>
                ),
              )}
            </div>

            <div className="profile-custom-option">
              <input
                type="text"
                value={customInterest}
                placeholder="Add your own interest"
                onChange={(event) =>
                  setCustomInterest(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    event.preventDefault();
                    addCustomInterest();
                  }
                }}
              />

              <button
                type="button"
                onClick={addCustomInterest}
              >
                Add
              </button>
            </div>

            {interests.length > 0 && (
              <div className="profile-selected-section">
                <p>Your interests</p>

                <div className="profile-selected-tags">
                  {interests.map(
                    (interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          removeInterest(
                            interest,
                          )
                        }
                      >
                        {interest}
                        <span>×</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </section>

          {/* SOCIETIES */}

          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>05</span>

              <div>
                <h2>Societies</h2>

                <p>
                  Select societies you're part of
                  or add your own.
                </p>
              </div>
            </div>

            <div className="profile-option-grid">
              {PREMADE_SOCIETIES.map(
                (society) => (
                  <button
                    key={society}
                    type="button"
                    className={
                      societies.includes(
                        society,
                      )
                        ? "profile-option-chip selected"
                        : "profile-option-chip"
                    }
                    onClick={() =>
                      toggleSociety(
                        society,
                      )
                    }
                  >
                    {society}
                  </button>
                ),
              )}
            </div>

            <div className="profile-custom-option">
              <input
                type="text"
                value={customSociety}
                placeholder="Add another society"
                onChange={(event) =>
                  setCustomSociety(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    event.preventDefault();
                    addCustomSociety();
                  }
                }}
              />

              <button
                type="button"
                onClick={addCustomSociety}
              >
                Add
              </button>
            </div>

            {societies.length > 0 && (
              <div className="profile-selected-section">
                <p>Your societies</p>

                <div className="profile-selected-tags">
                  {societies.map(
                    (society) => (
                      <button
                        key={society}
                        type="button"
                        onClick={() =>
                          removeSociety(
                            society,
                          )
                        }
                      >
                        {society}
                        <span>×</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ACTIONS */}

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="profile-save-button"
            >
              Save profile
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProfilePage;