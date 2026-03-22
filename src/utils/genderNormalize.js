const genderMap = {
  male: "m",
  female: "f",
  other: "o",
};

export const normalizeGender = (gender) => {
  return gender ? genderMap[String(gender).toLowerCase()] : null;
};
