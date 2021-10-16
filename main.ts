import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client = axios.create({
  baseURL:
    'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices',
  headers: {
    'x-rapidapi-host': process.env.API_HOST!,
    'x-rapidapi-key': process.env.API_KEY!,
  },
});

interface QuoteAPIResponse {
  QuoteId: number;
  MinPrice: number;
  Direct: Boolean;
  OutboundLeg: {
    CarrierIds: number[];
    OriginId: number;
    DestinationId: number;
    DepartureDate: string;
  };
  QuoteDateTime: string;
}

interface CarrierAPIResponse {
  CarrierId: number;
  Name: string;
}

interface PlaceAPIResponse {
  Name: string;
  Type: string;
  PlaceId: number;
  IataCode: string;
  SkyscannerCode: string;
  CityName: string;
  CityId: string;
  CountryName: string;
}

interface CurrencyAPIResponse {
  Code: string;
  Symbol: string;
  ThousandsSeparator: string;
  DecimalSeparator: string;
  SymbolOnLeft: Boolean;
  SpaceBetweenAmountAndSymbol: Boolean;
  RoundingCoefficient: number;
  DecimalDigits: number;
}

const browsequotes = async ({
  currencyCode = 'USD',
  locale = 'en-US',
  from = 'ANKA-sky',
  to = 'anywhere',
  time = 'anytime',
}) => {
  const url = `/browsequotes/v1.0/US/${currencyCode}/${locale}/${from}/${to}/${time}`;
  console.log(url);
  const { data } = (await client.get(url)) as {
    data: {
      Quotes: QuoteAPIResponse[];
      Carriers: CarrierAPIResponse[];
      Places: PlaceAPIResponse[];
      Currencies: CurrencyAPIResponse[];
    };
  };

  const { Quotes, Carriers, Places, Currencies } = data;

  const getPlaceById = (id: number) =>
    Places.find((place) => place.PlaceId === id);
  const getCarrierById = (id: number) =>
    Carriers.find((carrier) => carrier.CarrierId === id);
  const getCurrencyByCode = (code: string): CurrencyAPIResponse =>
    Currencies.find(
      (currency) => currency.Code === code
    ) as CurrencyAPIResponse;
  const displayPrice = (currency: CurrencyAPIResponse, amount: number) =>
    currency.SymbolOnLeft
      ? `${currency.Symbol} ${amount}`
      : `${amount} ${currency.Symbol}`;

  return Quotes.map((quote) => {
    return {
      id: quote.QuoteId,
      price: displayPrice(getCurrencyByCode(currencyCode), quote.MinPrice),
      direct: quote.Direct,
      from: getPlaceById(quote.OutboundLeg.OriginId),
      to: getPlaceById(quote.OutboundLeg.DestinationId),
      date: quote.OutboundLeg.DepartureDate,
      carriers: getCarrierById(quote.OutboundLeg.CarrierIds[0]),
    };
  });
};

browsequotes({ currencyCode: 'TRY', from: 'ANKA-sky' })
  .then((results) => {
    results.forEach((r) => {
      console.log(`#${r.id} | ${new Date(r.date).toDateString()} | ${r.price}`);
      console.log(`${r.from?.Name} to ${r.to?.Name} (${r.to?.CountryName})`);
      console.log(r.carriers?.Name);
      console.log("------------------------------- \n")
    });
  })
  .catch((e) => console.log(e));
