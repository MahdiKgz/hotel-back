const yup = require("yup");

const createReservationValidator = yup
  .object({
    hotelId: yup.number().integer().positive().required("شناسه هتل الزامی است"),
    roomId: yup.number().integer().positive().required("شناسه اتاق الزامی است"),
    startDate: yup.string().required("تاریخ ورود الزامی است"),
    endDate: yup.string().required("تاریخ خروج الزامی است"),
    note: yup.string().optional(),
  })
  .test(
    "dates-order",
    "تاریخ شروع باید قبل از تاریخ پایان باشد",
    function ({ startDate, endDate }) {
      if (!startDate || !endDate) return true;
      return new Date(startDate) < new Date(endDate);
    },
  );

module.exports = {
  createReservationValidator,
};
