import { AxiosInstance } from 'axios';

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

export class SkyScannerApi {
  constructor(private _client: AxiosInstance) {}
  async getFlights({
    currencyCode = 'USD',
    locale = 'en-US',
    from = 'ANKA-sky',
    to = 'anywhere',
    time = 'anytime',
  }) {
    const url = `/browsequotes/v1.0/US/${currencyCode}/${locale}/${from}/${to}/${time}`;

    const { data } = (await this._client.get(url)) as {
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
  }
}
