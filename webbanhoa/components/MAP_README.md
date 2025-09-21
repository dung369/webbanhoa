MapAddressPicker component

- File: components/map-address-picker.tsx
- Purpose: provide a Shopee-like address picker with Google Maps autocomplete, draggable marker, and simple delivery-fee/distance calculation.

Setup

1. Create a Google Cloud project and enable the Maps JavaScript API and Places API.
2. Create an API key and restrict it to your domain.
3. Add the key to your environment as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (e.g., in .env.local):

   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

Detailed steps:

- Go to https://console.cloud.google.com/ and create/select a project.
- In "APIs & Services" > "Library" enable these APIs:
  - Maps JavaScript API
  - Places API
- In "APIs & Services" > "Credentials" create an API key.
- Click the key and under "Application restrictions" choose "HTTP referrers (web sites)" and add your dev host (e.g., http://localhost:3000) and production host.
- Under "API restrictions" select "Restrict key" and add Maps JavaScript API and Places API.

Local testing:

- Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- Restart the Next.js dev server after changing `.env.local`.

Deploying (Vercel):

- In your Vercel project settings, go to "Environment Variables" and add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with the key value. Add it for the appropriate environments (Preview/Production).
- Redeploy your site after adding the variable.

Integration

- The component is client-only and loaded dynamically in the checkout page.
- MapAddressPicker's `onChange` receives a `PickedAddress` object:
  {
    lat: number,
    lng: number,
    formatted: string,
    components: { street_number, route, sublocality, locality, administrative_area_level_1, country, postal_code }
  }

- Wire `onChange` to store the selected address into your form state. Persist both the `formatted` address and the `lat`/`lng` to your order object.

Fallback (typed address)

- If the Google Maps API key is missing, or the user types an address without selecting an autocomplete suggestion, the component will accept the typed address as a fallback. In that case `PickedAddress.lat` and `PickedAddress.lng` may be null, but `PickedAddress.formatted` will contain the typed address string.
- The checkout form validation accepts a non-empty `formatted` address even when lat/lng are null, so orders can be placed during development without a Maps API key.

Delivery rules

- The component includes a simple example: store center at HCMC and 30km max delivery radius. Replace with your real store coordinates and business rules.

Security

- Keep the API key restricted to allowed referrers. Do not commit .env.local to source control.

