const yup = require("yup");

const createReservationValidator = yup
  .object({
    hotelId: yup.number().integer().positive().required("شناسه هتل الزامی است"),
    userId: yup
      .number()
      .integer()
      .positive()
      .required("شناسه کاربر الزامی است"),
    roomId: yup.number().integer().positive().required("شناسه اتاق الزامی است"),
    startDate: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ شروع باید YYYY-MM-DD باشد")
      .required("تاریخ شروع الزامی است"),
    endDate: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ پایان باید YYYY-MM-DD باشد")
      .required("تاریخ پایان الزامی است"),
    note: yup.string().optional(),
  })
  .test(
    "dates-order",
    "تاریخ شروع باید قبل از تاریخ پایان باشد",
    function ({ startDate, endDate }) {
      if (!startDate || !endDate) return true;
      return new Date(startDate) <= new Date(endDate);
    },
  );

module.exports = {
  createReservationValidator,
};
