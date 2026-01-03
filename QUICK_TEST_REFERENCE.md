# 🚌 Quick Test Data Reference Card

## ⚡ Fast Access - Test Everything Now

### Navigation Links to Test
```
✅ Find Buses:     /search
✅ Routes:         /routes  
✅ Operators:      /operators
✅ Partner Hub:    /partner
```

---

## 📋 6 Ready-to-Use Test Operators

| # | Company | Buses | Routes | Status | City |
|---|---------|-------|--------|--------|------|
| 1 | **Kilimanjaro Express** | 3 | 3 | ✅ Approved | Dar es Salaam |
| 2 | **Scandinavian Express** | 2 | 3 | ✅ Approved | Arusha |
| 3 | **Safari Star Coaches** | 2 | 2 | ✅ Approved | Mwanza |
| 4 | **Coastal Routes Ltd** | 1 | 2 | ✅ Approved | Dodoma |
| 5 | **Kilimanjaro Peak Shuttles** | 1 | 2 | ✅ Approved | Kilimanjaro |
| 6 | **Safari Express** | 3 | 6 | ✅ Approved | Multi-Regional |

---

## 🚍 12 Test Buses Available

### Kilimanjaro Express (KE)
```
KE-001: T123 ABC | 57 seats | Luxury | Standard Layout
KE-002: T124 DEF | 53 seats | Luxury | Compact Layout  
KE-003: T125 GHI | 56 seats | Semi-Luxury | Standard Layout
```

### Scandinavian Express (SE)
```
SE-001: T456 JKL | 53 seats | Luxury | Compact Layout
SE-002: T457 MNO | 57 seats | Semi-Luxury | Standard Layout
```

### Safari Star Coaches (SSC)
```
SSC-001: T789 PQR | 56 seats | Standard | Layout1
SSC-002: T790 STU | 57 seats | Standard | Layout2
```

### Coastal Routes Ltd (CR)
```
CR-001: T901 VWX | 57 seats | Luxury | Standard Layout
```

### Kilimanjaro Peak Shuttles (KPS)
```
KPS-001: T234 YZA | 53 seats | Luxury | Compact Layout
```

---

## 🗺️ Popular Test Routes

| From | To | Operator | Distance | Duration |
|------|-----|----------|----------|----------|
| Dar | Arusha | Kilimanjaro Express | 600 km | 9.5 hrs |
| Dar | Mwanza | Kilimanjaro Express | 1100 km | 14 hrs |
| Dar | Dodoma | Kilimanjaro Express | 450 km | 6.5 hrs |
| Arusha | Dar | Scandinavian Express | 600 km | 9.5 hrs |
| Arusha | Moshi | Scandinavian Express | 100 km | 1.5 hrs |
| Mwanza | Dar | Safari Star Coaches | 1100 km | 14 hrs |
| Dodoma | Dar | Coastal Routes Ltd | 450 km | 6.5 hrs |
| Moshi | Dar | Kilimanjaro Peak | 700 km | 10 hrs |

---

## 💰 Price Range
- **Budget Routes:** 12,000 - 28,000 TZS (short distance)
- **Standard Routes:** 32,000 - 45,000 TZS (medium distance)
- **Premium Routes:** 48,000 - 55,000 TZS (long distance)

---

## 🎯 Test Scenarios (Copy & Paste)

### Scenario 1: Search Dar → Arusha
```
FROM:   Dar es Salaam
TO:     Arusha
DATE:   Tomorrow (or any future date)
RESULT: 2 operators, 2-3 buses shown
PRICE:  45,000 - 50,000 TZS
```

### Scenario 2: View All Routes
```
PAGE:    /routes
RESULT:  20 routes across 6 operators
DETAILS: Terminals, distance, duration, operators
```

### Scenario 3: Explore Operators
```
PAGE:    /operators  
RESULT:  6 operator cards
DETAILS: Company info, contact, buses, routes
```

### Scenario 4: Book a Ticket
```
STEP 1:  Find Buses (Dar → Arusha, Tomorrow)
STEP 2:  Select Kilimanjaro Express KE-001 (08:00)
STEP 3:  Choose seats from 57 available
STEP 4:  Enter passenger details
STEP 5:  Review & confirm booking
RESULT:  Booking confirmed with QR code
```

---

## 📊 Database Stats

```
✅ Total Operators:      6 (all approved)
✅ Total Buses:          12 (various types)
✅ Total Routes:         20 (different regions)
✅ Total Schedules:      284+ (daily trips)
✅ Seat Layouts:         2 types (Standard & Compact)
✅ Regions Connected:    5 (Dar, Arusha, Mwanza, Dodoma, Kilimanjaro)
```

---

## 🔧 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| No buses showing | Check date is future (tomorrow+) |
| Routes empty | Verify operators have active buses |
| Seats not clickable | Ensure schedule has available_seats > 0 |
| Wrong price | Check schedule price_tzs value |
| Operator missing | Verify status = 'approved' |

---

## 📱 Test Account (Already Seeded)

**Account Option 1:** Existing Test Account
```
Email:    dndubussa@gmail.com
Role:     Operator
Operator: Kilimanjaro Express ✅ Approved
```

**Account Option 2:** Register New
```
Path:     /partner
Status:   Pending (requires admin approval)
Can test: Operator features, company info form
```

---

## 🎪 What Each Page Should Show

### /search (Find Buses)
```
✓ Search form with: From, To, Date
✓ Results showing multiple operators
✓ Bus details: operator, departure, price
✓ "Select" button for each trip
✓ Seat layout grid on selection
```

### /routes (Routes Page)
```
✓ List of all 20 routes
✓ Each route shows: terminals, distance, duration
✓ Operator name linked
✓ Filter/search capability
✓ Route detail page on click
```

### /operators (Operators Page)
```
✓ 6 operator cards displayed
✓ Company name, logo, location
✓ Contact info visible
✓ Number of buses/routes shown
✓ Operator detail page on click
✓ Lists their buses and routes
```

---

## 🚀 Advanced Testing

### Load Testing
- **High Volume Operator:** Safari Express (270+ schedules)
- Perfect for testing search performance with large datasets

### Seat Layout Testing
- **Standard Layout:** KE-001 (T123 ABC) - Dar→Arusha
- **Compact Layout:** KE-002 (T124 DEF) - Dar→Arusha
- Same route, different layouts for comparison

### Region Coverage Testing
- Test all 5 regions connecting to each other
- Verify routes exist between all major cities
- Check terminal information accuracy

### Multi-Operator Testing
- Same route served by different operators
- Example: Dar→Arusha has 2 operators (Kilimanjaro + Scandinavian)
- Compare prices, schedules, amenities

---

## 📞 Operator Contact Info (for reference)

| Company | Email | Phone | License |
|---------|-------|-------|---------|
| Kilimanjaro Express | info@kilimanjaroexpress.co.tz | +255712345678 | LIC-2024-KE-001 |
| Scandinavian Express | contact@scandinavianexpress.co.tz | +255765432109 | LIC-2024-SE-001 |
| Safari Star Coaches | bookings@safaristarchcoaches.co.tz | +255754567890 | LIC-2024-SSC-001 |
| Coastal Routes Ltd | info@coastalroutes.co.tz | +255789123456 | LIC-2024-CR-001 |
| Kilimanjaro Peak | reservations@peakshuttles.co.tz | +255712890123 | LIC-2024-KPS-001 |
| Safari Express | info@safariexpress.co.tz | +255765432100 | LIC-2024-SE-002 |

---

## ✨ Features to Validate

- [ ] All operators show in /operators page
- [ ] All routes display in /routes page  
- [ ] Search finds correct buses
- [ ] Seat layout renders correctly
- [ ] Prices calculate properly
- [ ] Operator links work
- [ ] Route details populate
- [ ] Booking flow completes
- [ ] Multiple operators for same route
- [ ] Different seat layouts display

---

**🎉 Everything is ready to test!**

**Start here:** Click "Find Buses" in the header and search Dar → Arusha for tomorrow

**Last Updated:** January 3, 2026 | **Status:** ✅ All Systems Go
