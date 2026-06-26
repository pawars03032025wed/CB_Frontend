import React from "react";
// @ts-ignore
import malePatientAvatar from "../../assets/images/male_patient_avatar_1779383224823.png";
// @ts-ignore
import femalePatientAvatar from "../../assets/images/female_patient_avatar_1779383239871.png";
// @ts-ignore
import defaultPatientAvatar from "../../assets/images/neutral_patient_avatar_1779383254112.png";

interface PatientAvatarProps {
  gender?: string | null;
  name?: string;
  size?: number; // Sizing in pixels (e.g., 32, 40, 48, 128)
  className?: string;
  onClick?: () => void;
}

export default function PatientAvatar({
  gender,
  name = "Patient",
  size = 40,
  className = "",
  onClick,
}: PatientAvatarProps) {
  // Normalize the gender parameter for robust matching
  const normalizedGender = gender
    ? String(gender).trim().toLowerCase()
    : "";
  
  const isMale = normalizedGender === "male" || normalizedGender === "m";
  const isFemale = normalizedGender === "female" || normalizedGender === "f";

  // Select the appropriate avatar image based on display logic
  const avatarSrc = isMale
    ? malePatientAvatar
    : isFemale
    ? femalePatientAvatar
    : defaultPatientAvatar;

  // Sizing styles
  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div
      style={sizeStyle}
      onClick={onClick}
      className={`relative inline-block overflow-hidden rounded-full shadow-sm bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex-shrink-0 transition-transform duration-200 active:scale-95 ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      id={`avatar-${normalizedGender || "neutral"}-${name.replace(/\s+/g, "-")}`}
    >
      <img
        src={avatarSrc}
        alt={`${name}'s Avatar`}
        className="w-full h-full object-cover rounded-full"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </div>
  );
}
