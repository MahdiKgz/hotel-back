const Province = require("../models/v1/Province.model");

const provincesData = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
];

const seedProvinces = async () => {
  const count = await Province.count();
  if (count === 0) {
    await Province.bulkCreate(
      provincesData.map((name) => ({ name })),
      { validate: true },
    );
    console.log("✅ Provinces seeded.");
  } else {
    console.log("ℹ️ Provinces already exist.");
  }
};

module.exports = seedProvinces;
