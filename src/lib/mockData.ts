export const mockSummaryData = [
  {
    id: 1,
    hotelName: "Bella Villa Pattaya 3rd Road",
    actualSales: 15000,
    dailyTarget: 20000,
    gap: -5000,
    status: "🔴 High Priority - ต้องเร่งอัดแคมเปญด่วน",
  },
  {
    id: 2,
    hotelName: "Grand Bella",
    actualSales: 45000,
    dailyTarget: 40000,
    gap: 5000,
    status: "🟢 On Track - ทำได้ตามเป้า",
  },
  {
    id: 3,
    hotelName: "Bella Express",
    actualSales: 18000,
    dailyTarget: 25000,
    gap: -7000,
    status: "🔴 High Priority - ต้องเร่งอัดแคมเปญด่วน",
  }
];

export const mockReservationsData = [
  {
    propertyName: "Bella Villa Pattaya 3rd Road",
    location: "Pattaya",
    bookerName: "John Doe",
    geniusBooker: "Yes",
    arrival: "2026-07-08",
    departure: "2026-07-09",
    bookedOn: "2026-07-01",
    status: "Confirmed",
    totalPayment: 1500.00,
    commission: 225.00,
    currency: "THB",
    reservationNumber: "5036317018"
  },
  {
    propertyName: "Grand Bella",
    location: "Pattaya",
    bookerName: "Jane Smith",
    geniusBooker: "No",
    arrival: "2026-07-08",
    departure: "2026-07-10",
    bookedOn: "2026-07-02",
    status: "Confirmed",
    totalPayment: 4500.00,
    commission: 675.00,
    currency: "THB",
    reservationNumber: "5036363828"
  },
  {
    propertyName: "Bella Express",
    location: "Pattaya",
    bookerName: "Alice Wong",
    geniusBooker: "Yes",
    arrival: "2026-07-09",
    departure: "2026-07-11",
    bookedOn: "2026-07-05",
    status: "Cancelled",
    totalPayment: 0.00,
    commission: 0.00,
    currency: "THB",
    reservationNumber: "5110104828"
  }
];
