// src/pages/EditProfilePage.jsx

import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase";

import "./EditProfilePage.css";

const PREMADE_INTERESTS = [
  "Anime", "Art", "Basketball", "Books", "Coding", "Design", "Film", "Food", "Gaming", "Gym", "Music", "Photography", "Running", "Startups", "Travel",
];

const PREMADE_LANGUAGES = [
  "English", "Mandarin", "Cantonese", "Korean", "Japanese", "Arabic", "Hindi", "Spanish", "French", "Urdu",
];

const PREMADE_SOCIETIES = [
  "SYNCS", "DataSoc", "PMSoc", "BoulderSoc", "ChairSoc",
];

// Mapping map linking interest keywords to suggested societies
const INTEREST_SOCIETY_MAP = {
  "Coding": ["SYNCS"],
  "DataSoc": ["DataSoc"],
  "Gaming": ["SYNCS"],
  "Gym": ["BoulderSoc", "ChairSoc"],
  "Running": ["BoulderSoc"],
  "Startups": ["PMSoc"],
  "Design": ["SYNCS"],
};

function EditProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [degree, setDegree] = useState("");
  const [major, setMajor] = useState("");
  const [secondMajorMinor, setSecondMajorMinor] = useState("");
  const [languages, setLanguages] = useState(["English"]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [interests, setInterests] = useState([]);
  const [customInterest, setCustomInterest] = useState("");
  const [societies, setSocieties] = useState([]);
  const [customSociety, setCustomSociety] = useState("");

  // Automatically compute suggested societies based on currently selected interests
  const suggestedSocieties = Array.from(
    new Set(
      interests.flatMap((interest) => INTEREST_SOCIETY_MAP[interest] || [])
    )
  ).filter((soc) => !societies.includes(soc));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setPronouns(data.pronouns || "");
          setBio(data.bio || "");
          setDegree(data.degree || "");
          setMajor(data.major || "");
          setSecondMajorMinor(data.second_major_minor || "");
          setLanguages(data.languages || ["English"]);
          setInterests(data.interests || []);
          setSocieties(data.societies || []);
          setProfilePicture(data.profilePicture || null);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  function handlePictureChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicture(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function toggleLanguage(language) {
    if (languages.includes(language)) {
      setLanguages(languages.filter((l) => l !== language));
      return;
    }
    setLanguages([...languages, language]);
  }

  function addCustomLanguage() {
    const cleaned = customLanguage.trim();
    if (!cleaned) return;
    if (!languages.some((l) => l.toLowerCase() === cleaned.toLowerCase())) {
      setLanguages([...languages, cleaned]);
    }
    setCustomLanguage("");
  }

  function removeLanguage(language) {
    setLanguages(languages.filter((l) => l !== language));
  }

  function toggleInterest(interest) {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
      return;
    }
    setInterests([...interests, interest]);
  }

  function addCustomInterest() {
    const cleaned = customInterest.trim();
    if (!cleaned) return;
    if (!interests.some((i) => i.toLowerCase() === cleaned.toLowerCase())) {
      setInterests([...interests, cleaned]);
    }
    setCustomInterest("");
  }

  function removeInterest(interest) {
    setInterests(interests.filter((i) => i !== interest));
  }

  function toggleSociety(society) {
    if (societies.includes(society)) {
      setSocieties(societies.filter((s) => s !== society));
      return;
    }
    setSocieties([...societies, society]);
  }

  function addCustomSociety() {
    const cleaned = customSociety.trim();
    if (!cleaned) return;
    if (!societies.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
      setSocieties([...societies, cleaned]);
    }
    setCustomSociety("");
  }

  function removeSociety(society) {
    setSocieties(societies.filter((s) => s !== society));
  }

  async function handleSave(event) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const profileData = {
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

    try {
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      navigate("/profile");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }

  function handleCancel() {
    navigate("/profile");
  }

  if (loading) {
    return <main className="profile-page"><div className="profile-container"><p>Loading...</p></div></main>;
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <section className="profile-heading">
          <p className="profile-eyebrow">EDIT YOUR PROFILE</p>
          <h1>Tell people who you are.</h1>
          <p>Update how you appear to other students on Chum Buddies.</p>
        </section>

        <form className="profile-form" onSubmit={handleSave}>
          {/* PROFILE PICTURE */}
          <section className="profile-form-card profile-picture-section">
            <div className="profile-picture-preview">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile preview" />
              ) : (
                <span>{name ? name.charAt(0).toUpperCase() : "?"}</span>
              )}
            </div>

            <div className="profile-picture-copy">
              <h2>Profile picture</h2>
              <p>Add a photo so people can recognise you.</p>
              <label className="profile-upload-button">
                Upload photo
                <input type="file" accept="image/*" onChange={handlePictureChange} />
              </label>
            </div>
          </section>

          {/* ABOUT */}
          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>01</span>
              <div>
                <h2>About you</h2>
                <p>The basics people will see on your profile.</p>
              </div>
            </div>

            <div className="profile-two-columns">
              <div className="profile-form-group">
                <label htmlFor="profile-name">Name or nickname</label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  placeholder="What should we call you?"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-pronouns">Pronouns</label>
                <input
                  id="profile-pronouns"
                  type="text"
                  value={pronouns}
                  placeholder="e.g. she/her"
                  onChange={(e) => setPronouns(e.target.value)}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                value={bio}
                maxLength={250}
                placeholder="Tell people a little about yourself..."
                onChange={(e) => setBio(e.target.value)}
              />
              <span className="profile-character-count">{bio.length}/250</span>
            </div>
          </section>

          {/* STUDY */}
          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>02</span>
              <div>
                <h2>Study</h2>
                <p>Optional — share what you're studying.</p>
              </div>
            </div>

            <div className="profile-two-columns">
              <div className="profile-form-group">
                <label htmlFor="profile-degree">Degree <span className="profile-optional">Optional</span></label>
                <input
                  id="profile-degree"
                  type="text"
                  value={degree}
                  placeholder="e.g. Bachelor of Arts"
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-major">Major <span className="profile-optional">Optional</span></label>
                <input
                  id="profile-major"
                  type="text"
                  value={major}
                  placeholder="e.g. Media Studies"
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-second-major">Second major / minor <span className="profile-optional">Optional</span></label>
              <input
                id="profile-second-major"
                type="text"
                value={secondMajorMinor}
                placeholder="e.g. Computer Science minor"
                onChange={(e) => setSecondMajorMinor(e.target.value)}
              />
            </div>
          </section>

          {/* LANGUAGES */}
          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>03</span>
              <div>
                <h2>Languages</h2>
                <p>Select the languages you're comfortable communicating in.</p>
              </div>
            </div>

            <div className="profile-option-grid">
              {PREMADE_LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  className={languages.includes(language) ? "profile-option-chip selected" : "profile-option-chip"}
                  onClick={() => toggleLanguage(language)}
                >
                  {language}
                </button>
              ))}
            </div>

            <div className="profile-custom-option">
              <input
                type="text"
                value={customLanguage}
                placeholder="Add another language"
                onChange={(e) => setCustomLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomLanguage();
                  }
                }}
              />
              <button type="button" onClick={addCustomLanguage}>Add</button>
            </div>

            {languages.length > 0 && (
              <div className="profile-selected-section">
                <p>Your languages</p>
                <div className="profile-selected-tags">
                  {languages.map((language) => (
                    <button key={language} type="button" onClick={() => removeLanguage(language)}>
                      {language} <span>×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* INTERESTS */}
          <section className="profile-form-card">
            <div className="profile-card-title">
              <span>04</span>
              <div>
                <h2>Interests</h2>
                <p>Pick anything you're into or add your own.</p>
              </div>
            </div>

            <div className="profile-option-grid">
              {PREMADE_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={interests.includes(interest) ? "profile-option-chip selected" : "profile-option-chip"}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="profile-custom-option">
              <input
                type="text"
                value={customInterest}
                placeholder="Add your own interest"
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomInterest();
                  }
                }}
              />
              <button type="button" onClick={addCustomInterest}>Add</button>
            </div>

            {interests.length > 0 && (
              <div className="profile-selected-section">
                <p>Your interests</p>
                <div className="profile-selected-tags">
                  {interests.map((interest) => (
                    <button key={interest} type="button" onClick={() => removeInterest(interest)}>
                      {interest} <span>×</span>
                    </button>
                  ))}
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
                <p>Select societies you're part of or add your own.</p>
              </div>
            </div>

            {/* SUGGESTED SOCIETIES BASED ON INTERESTS */}
            {suggestedSocieties.length > 0 && (
              <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(238, 108, 77, 0.08)", borderRadius: "12px" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "var(--ochre)" }}>
                  Suggested based on your interests:
                </p>
                <div className="profile-option-grid">
                  {suggestedSocieties.map((society) => (
                    <button
                      key={`suggested-${society}`}
                      type="button"
                      className="profile-option-chip"
                      style={{ borderStyle: "dashed" }}
                      onClick={() => toggleSociety(society)}
                    >
                      + {society}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="profile-option-grid">
              {PREMADE_SOCIETIES.map((society) => (
                <button
                  key={society}
                  type="button"
                  className={societies.includes(society) ? "profile-option-chip selected" : "profile-option-chip"}
                  onClick={() => toggleSociety(society)}
                >
                  {society}
                </button>
              ))}
            </div>

            <div className="profile-custom-option">
              <input
                type="text"
                value={customSociety}
                placeholder="Add another society"
                onChange={(e) => setCustomSociety(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSociety();
                  }
                }}
              />
              <button type="button" onClick={addCustomSociety}>Add</button>
            </div>

            {societies.length > 0 && (
              <div className="profile-selected-section">
                <p>Your societies</p>
                <div className="profile-selected-tags">
                  {societies.map((society) => (
                    <button key={society} type="button" onClick={() => removeSociety(society)}>
                      {society} <span>×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ACTIONS */}
          <div className="profile-form-actions">
            <button type="button" className="profile-cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="profile-save-button">
              Save profile
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProfilePage;