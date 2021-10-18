import axios from 'axios';
import dotenv from 'dotenv';
import { SkyScannerApi } from './services/SkyScannerApi';

dotenv.config();

const api = new SkyScannerApi(
  axios.create({
    baseURL:
      'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices',
    headers: {
      'x-rapidapi-host': process.env.API_HOST!,
      'x-rapidapi-key': process.env.API_KEY!,
    },
  })
);

api
  .getFlights({ currencyCode: 'TRY', from: 'ANKA-sky' })
  .then((results) => {
    results.forEach((r) => {
      console.log(`#${r.id} | ${new Date(r.date).toDateString()} | ${r.price}`);
      console.log(`${r.from?.Name} to ${r.to?.Name} (${r.to?.CountryName})`);
      console.log(r.carriers?.Name);
      console.log('------------------------------- \n');
    });
  })
  .catch((e) => console.log(e));
