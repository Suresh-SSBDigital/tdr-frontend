export interface PurchaseNotification {
  sno: number
  name: string
  address: string
  city: string
  mobileNo: string
  email: string
  message: string
  requestDate: string
}

export interface SaleNotification {
  sno: number
  name: string
  mobileNo: string
  email: string
  city: string
  drcNo: string
  requestedValueForSale: number
  requestDate: string
}

export const purchaseNotifications: PurchaseNotification[] = [
  { sno: 1, name: 'Manoj Dhanotiya', address: '106 Cap C S Naidu Arcade', city: 'Indore', mobileNo: '8989122232', email: 'Md@micromitti.com', message: 'We are looking to buy TDR', requestDate: '19/AUG/2025' },
  { sno: 2, name: 'Century 21 Town planners pvt Ltd', address: '11Th floor C21 Business Park Opp radission Hotel Indore', city: 'Indore', mobileNo: '9425314153', email: 'ca@c21mall.com', message: 'We are interested in buying 11,000 Sqm TDR', requestDate: '21/AUG/2025' },
  { sno: 3, name: 'SSK Prime Properties LLP', address: '402, Fortune Ambience, South Tukoganj, Indore', city: 'Indore', mobileNo: '7014861474', email: 'sskprimeproperties@gmailcom', message: 'We are interested to buy TDR', requestDate: '27/AUG/2025' },
  { sno: 4, name: 'Mdk Realty LLP', address: 'Plot 16c sch 94c ringroad indore', city: 'Indore', mobileNo: '9993520620', email: 'mohitlalwani@gmail.com', message: 'I want to purchase Tdr pleae contact at 9993420620', requestDate: '08/OCT/2025' },
  { sno: 5, name: 'BRILLIANT ESTATES LIMITED', address: '8TH FLOOR ,BRILLIANT PLATINA, PLOT NO 8, SCHEME NO 78 PART 2 PSP INDORE', city: 'INDORE', mobileNo: '7389937008', email: 'info@brilliantestate.com', message: 'WE ARE AVAILABLE TO PURCHASE THE TDR ANY WHERE IN INDORE PLEASE CONTACT US.', requestDate: '09/DEC/2025' },
  { sno: 6, name: 'Mihir', address: 'Dhar, MP', city: 'Dhar', mobileNo: '8000302022', email: 'ajudiya97@gmail.com', message: 'We are real estate developer in the State of MP and Gujarat. Currently, we developing our project in Indore. We have land in Indore and want extra FSI from TDR. Please revert if there are any land/ FSI credits.', requestDate: '28/DEC/2025' },
  { sno: 7, name: 'Mihir', address: 'Dhar, MP', city: 'Dhar', mobileNo: '8000302022', email: 'ajudiya97@gmail.com', message: 'We are real estate developer in the State of MP and Gujarat. Currently, we developing our project in Indore. We have land in Indore and want extra FSI from TDR. Please revert if there are any land/ FSI credits.', requestDate: '28/DEC/2025' },
  { sno: 8, name: 'Mihir', address: 'Dhar, MP', city: 'Dhar', mobileNo: '8000302022', email: 'ajudiya97@gmail.com', message: 'We are real estate developer in the State of MP and Gujarat. Currently, we developing our project in Indore. We have land in Indore and want extra FSI from TDR. Please revert if there are any land/ FSI credits.', requestDate: '28/DEC/2025' },
  { sno: 9, name: 'Global Infrastructure', address: '2FA, Global Paradise', city: 'Indore', mobileNo: '9171000021', email: 'modi.robin@gmail.com', message: 'we need to buy TDR from any one interested', requestDate: '07/FEB/2026' },
  { sno: 10, name: 'VIBRANT DEVCON LLP INDORE.', address: '203 SANGHI MANOR 6-2 Y.N ROAD INDORE', city: 'INDORE', mobileNo: '9424485000', email: 'vivekavadhi@yahoo.in', message: 'WE ARE AVAILABLE TO PURCHASE THE TDR ANY WHERE IN INDORE PLEASE CONTACT US.', requestDate: '18/MAR/2026' },
  { sno: 11, name: 'Aditya Malpani', address: '204 President Plaza 166 RNT Marg Indore', city: 'Indore', mobileNo: '9691081030', email: 'adityamalpani8@gmail.com', message: 'WE PURCHASE TDR IN INDORE [IN AND OUT OF MUNICIPAL AREAS]. PLEASE CONNECT AT THE SHARED DETAILS.', requestDate: '26/MAR/2026' },
  { sno: 12, name: 'D.C.N.P.L. Pvt Ltd tarfe Directore Shree Sanjay Jain', address: '55 Prince Yashwant Road Ashok Heritage 3rd floor Indore', city: 'Indore', mobileNo: '9893127299', email: 'sanjayjain799@dcnpl.com', message: 'WE ARE AVAILABLE TO PURCHASE THE TDR ANY WHERE IN INDORE PLEASE CONTACT US', requestDate: '24/APR/2026' },
  { sno: 13, name: 'D.C.N.P.L. Pvt Ltd Tarfe Director Shree Sanjay jain', address: '55 Prince yashwant Road Ashok heritage 3rd Floor Indore', city: 'Indore', mobileNo: '9893127299', email: 'sanjayjain799@dcnpl.com', message: 'WE ARE AVAILABLE TO PURCHASE THE TDR ANY WHERE IN INDORE CITY PLEASE CONTECT US.', requestDate: '24/APR/2026' },
]

export const saleNotifications: SaleNotification[] = [
  { sno: 1, name: 'Ravishankar Chouhan', mobileNo: '8120656578', email: 'ravishankarji001@gmail.com', city: 'INDORE', drcNo: 'SXGS712Aug2024', requestedValueForSale: 21.96, requestDate: '06/DEC/2025' },
  { sno: 2, name: 'Krishnkumar Khandaiya', mobileNo: '9754900227', email: 'krishnakumar48@gmail.com', city: 'INDORE', drcNo: '6NCK308Nov2025', requestedValueForSale: 53, requestDate: '20/DEC/2025' },
  { sno: 3, name: 'गिरीराज पोरवाल', mobileNo: '9425961046', email: 'girirajporwal@gmail.com', city: 'INDORE', drcNo: '28B7K29Oct2025', requestedValueForSale: 33.32, requestDate: '22/DEC/2025' },
  { sno: 4, name: 'संजय प्रजापति केशर बाई पिता रमेष प्रजापति', mobileNo: '8269913327', email: 'sanjay.prajat84@gmail.com', city: 'INDORE', drcNo: 'ZQP9S24Oct2025', requestedValueForSale: 67.08, requestDate: '22/DEC/2025' },
  { sno: 5, name: 'Vijay Rathore', mobileNo: '9617101570', email: 'vijayrathor145@gmail.com', city: 'INDORE', drcNo: 'UGWYS12Aug2024', requestedValueForSale: 25.46, requestDate: '22/DEC/2025' },
  { sno: 6, name: 'विजय पिता दुर्लभ दास', mobileNo: '9869959222', email: 'vijaysoda13@gmail.com', city: 'INDORE', drcNo: 'SUMHV01Jan2026', requestedValueForSale: 42.75, requestDate: '07/JAN/2026' },
  { sno: 7, name: 'राजकुमारी पति महेश कुमार', mobileNo: '9926059315', email: 'Kapiljhiniwal143@gmail.com', city: 'INDORE', drcNo: 'R130T01Jan2026', requestedValueForSale: 36.81, requestDate: '04/FEB/2026' },
  { sno: 8, name: 'Rajesh Doshi', mobileNo: '9827340159', email: 'rajeshdosi14@gmail.com', city: 'INDORE', drcNo: '1691B10Feb2026', requestedValueForSale: 68.84, requestDate: '11/FEB/2026' },
  { sno: 9, name: 'मो. शाहिद साबरी पिता मो. इकबाल, मो. साजिद पिता मोहम्मद इकबाल, मो. अरशद साबरी पिता स्व. मो. अशफाक साबरी, मो. खालिद साबरी, मो. राशिद साबरी', mobileNo: '9827736060', email: 'mohammadyasir@gmail.com', city: 'INDORE', drcNo: '35JQ710Feb2026', requestedValueForSale: 67.72, requestDate: '16/APR/2026' },
]
