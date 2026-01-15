# AI-Powered Pharmacy Frontend (React)

This React app is built to match the Spring Boot backend APIs you described.

## Tech
- React + Vite
- React Router v6
- Axios
- Tailwind CSS
- JWT stored in `localStorage`

## Folder Structure
```
src/
  components/
  context/
  pages/
    admin/
    customer/
    pharmacy/
  services/
  utils/
```

## Required Backends
- Spring Boot: `http://localhost:8080`
- FastAPI AI service: `http://localhost:8000`

## Run
```bash
npm install
npm run dev
```

## Notes about Order Creation
The order API requires `medicineId`:
```json
{ "items": [{ "medicineId": 1, "quantity": 2 }] }
```
If your `/medicines/search` response doesn't include `medicineId`, the UI will block ordering.

**Fix (recommended):** return `medicineId` in the Spring Boot search response DTO.


### Backend patch example (search DTO)
- Add field `medicineId` to `PharmacyMedicineResult`
- Set it from stock/medicine in your `MedicineService`

