export const coin = {
    name:'', 
    symbol: '',
    pubkeys : {},
    txList : [],
    swapList : [],
}

export const pubkey = {
    nickname : '',
    active: false,
    balance: 0,
    USD_value : 0,
    vk : '',
    sk : '',
}

export const token = {
    name: '',
    nickname: '',
    symbol : '',
    token_address : '',
    decimals : 18,
    balance: 0,
    USD_value: 0,
}

export const currencyList = [
    {'name' : 'United States Dollar ($)' , 'code' : 'USD'},
    {'name' : 'Albanian Lek (L)' , 'code' : 'ALL'},
    {'name' : 'Algerian Dinar (د.ج)' , 'code' : 'DZD'},
    {'name' : 'Argentine Peso ($)' , 'code' : 'ARS'},
    {'name' : 'Armenian Dram (֏)' , 'code' : 'AMD'},
    {'name' : 'Australian Dollar ($)' , 'code' : 'AUD'},
    {'name' : 'Azerbaijani Manat (₼)' , 'code' : 'AZN'},
    {'name' : 'Bahraini Dinar (.د.ب)' , 'code' : 'BHD'},
    {'name' : 'Bangladeshi Taka (৳)' , 'code' : 'BDT'},
    {'name' : 'Belarusian Ruble (Br)' , 'code' : 'BYN'},
    {'name' : 'Bermudan Dollar ($)' , 'code' : 'BMD'},
    {'name' : 'Bolivian Boliviano (Bs.)' , 'code' : 'BOB'},
    {'name' : 'Bosnia-Herzegovina Convertible Mark (KM)' , 'code' : 'BAM'},
    {'name' : 'Brazilian Real (R$)' , 'code' : 'BRL'},
    {'name' : 'Bulgarian Lev (лв)' , 'code' : 'BGN'},
    {'name' : 'Cambodian Riel (៛)' , 'code' : 'KHR'},
    {'name' : 'Canadian Dollar ($)' , 'code' : 'CAD'},
    {'name' : 'Chilean Peso ($)' , 'code' : 'CLP'},
    {'name' : 'Chinese Yuan (¥)' , 'code' : 'CNY'},
    {'name' : 'Colombian Peso ($)' , 'code' : 'COP'},
    {'name' : 'Costa Rican Colón (₡)' , 'code' : 'CRC'},
    {'name' : 'Croatian Kuna (kn)' , 'code' : 'HRK'},
    {'name' : 'Cuban Peso ($)' , 'code' : 'CUP'},
    {'name' : 'Czech Koruna (Kč)' , 'code' : 'CZK'},
    {'name' : 'Danish Krone (kr)' , 'code' : 'DKK'},
    {'name' : 'Dominican Peso ($)' , 'code' : 'DOP'},
    {'name' : 'Egyptian Pound (£)' , 'code' : 'EGP'},
    {'name' : 'Euro (€)' , 'code' : 'EUR'},
    {'name' : 'Georgian Lari (₾)' , 'code' : 'GEL'},
    {'name' : 'Ghanaian Cedi (₵)' , 'code' : 'GHS'},
    {'name' : 'Guatemalan Quetzal (Q)' , 'code' : 'GTQ'},
    {'name' : 'Honduran Lempira (L)' , 'code' : 'HNL'},
    {'name' : 'Hong Kong Dollar ($)' , 'code' : 'HKD'},
    {'name' : 'Hungarian Forint (Ft)' , 'code' : 'HUF'},
    {'name' : 'Icelandic Króna (kr)' , 'code' : 'ISK'},
    {'name' : 'Indian Rupee (₹)' , 'code' : 'INR'},
    {'name' : 'Indonesian Rupiah (Rp)' , 'code' : 'IDR'},
    {'name' : 'Iranian Rial (﷼)' , 'code' : 'IRR'},
    {'name' : 'Iraqi Dinar (ع.د)' , 'code' : 'IQD'},
    {'name' : 'Israeli New Shekel (₪)' , 'code' : 'ILS'},
    {'name' : 'Jamaican Dollar ($)' , 'code' : 'JMD'},
    {'name' : 'Japanese Yen (¥)' , 'code' : 'JPY'},
    {'name' : 'Jordanian Dinar (د.ا)' , 'code' : 'JOD'},
    {'name' : 'Kazakhstani Tenge (₸)' , 'code' : 'KZT'},
    {'name' : 'Kenyan Shilling (Sh)' , 'code' : 'KES'},
    {'name' : 'Kuwaiti Dinar (د.ك)' , 'code' : 'KWD'},
    {'name' : 'Kyrgystani Som (с)' , 'code' : 'KGS'},
    {'name' : 'Lebanese Pound (ل.ل)' , 'code' : 'LBP'},
    {'name' : 'Macedonian Denar (ден)' , 'code' : 'MKD'},
    {'name' : 'Malaysian Ringgit (RM)' , 'code' : 'MYR'},
    {'name' : 'Mauritian Rupee (₨)' , 'code' : 'MUR'},
    {'name' : 'Mexican Peso ($)' , 'code' : 'MXN'},
    {'name' : 'Moldovan Leu (L)' , 'code' : 'MDL'},
    {'name' : 'Mongolian Tugrik (₮)' , 'code' : 'MNT'},
    {'name' : 'Moroccan Dirham (د.م.)' , 'code' : 'MAD'},
    {'name' : 'Myanma Kyat (Ks)' , 'code' : 'MMK'},
    {'name' : 'Namibian Dollar ($)' , 'code' : 'NAD'},
    {'name' : 'Nepalese Rupee (₨)' , 'code' : 'NPR'},
    {'name' : 'New Taiwan Dollar ($)' , 'code' : 'TWD'},
    {'name' : 'New Zealand Dollar ($)' , 'code' : 'NZD'},
    {'name' : 'Nicaraguan Córdoba (C$)' , 'code' : 'NIO'},
    {'name' : 'Nigerian Naira (₦)' , 'code' : 'NGN'},
    {'name' : 'Norwegian Krone (kr)' , 'code' : 'NOK'},
    {'name' : 'Omani Rial (ر.ع.)' , 'code' : 'OMR'},
    {'name' : 'Pakistani Rupee (₨)' , 'code' : 'PKR'},
    {'name' : 'Panamanian Balboa (B/.)' , 'code' : 'PAB'},
    {'name' : 'Peruvian Sol (S/.)' , 'code' : 'PEN'},
    {'name' : 'Philippine Peso (₱)' , 'code' : 'PHP'},
    {'name' : 'Polish Złoty (zł)' , 'code' : 'PLN'},
    {'name' : 'Pound Sterling (£)' , 'code' : 'GBP'},
    {'name' : 'Qatari Rial (ر.ق)' , 'code' : 'QAR'},
    {'name' : 'Romanian Leu (lei)' , 'code' : 'RON'},
    {'name' : 'Russian Ruble (₽)' , 'code' : 'RUB'},
    {'name' : 'Saudi Riyal (ر.س)' , 'code' : 'SAR'},
    {'name' : 'Serbian Dinar (дин.)' , 'code' : 'RSD'},
    {'name' : 'Singapore Dollar ($)' , 'code' : 'SGD'},
    {'name' : 'South African Rand (Rs)' , 'code' : 'ZAR'},
    {'name' : 'South Korean Won (₩)' , 'code' : 'KRW'},
    {'name' : 'South Sudanese Pound (£)' , 'code' : 'SSP'},
    {'name' : 'Sovereign Bolivar (Bs.)' , 'code' : 'VES'},
    {'name' : 'Sri Lankan Rupee (Rs)' , 'code' : 'LKR'},
    {'name' : 'Swedish Krona ( kr)' , 'code' : 'SEK'},
    {'name' : 'Swiss Franc (Fr)' , 'code' : 'CHF'},
    {'name' : 'Thai Baht (฿)' , 'code' : 'THB'},
    {'name' : 'Trinidad and Tobago Dollar ($)' , 'code' : 'TTD'},
    {'name' : 'Tunisian Dinar (د.ت)' , 'code' : 'TND'},
    {'name' : 'Turkish Lira (₺)' , 'code' : 'TRY'},
    {'name' : 'Ugandan Shilling (Sh)' , 'code' : 'UGX'},
    {'name' : 'Ukrainian Hryvnia (₴)' , 'code' : 'UAH'},
    {'name' : 'United Arab Emirates Dirham (د.إ)' , 'code' : 'AED'},
    {'name' : 'Uruguayan Peso ($)' , 'code' : 'UYU'},
    {'name' : 'Uzbekistan Som (so\'m)' , 'code' : 'UZS'},
    {'name' : 'Vietnamese Dong (₫)' , 'code' : 'VND'}
]