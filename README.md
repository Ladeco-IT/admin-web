# Ladeco IT Admin

Admin portaal om afspraken in te plannen voor klanten.

## Functionaliteit

- Admin vult naam, e-mail, adres, reden, datum en uur in.
- API valideert invoer server-side.
- Klant ontvangt een bedankmail met afspraakdetails.
- Mail bevat een .ics uitnodiging (werkt met Apple Agenda en andere agenda-apps).
- Google Agenda wordt automatisch gesynchroniseerd als Google credentials ingevuld zijn.

## Starten in development

```bash
npm install
npm run dev
```

Open daarna `http://localhost:3000`.

## Environment variabelen

Maak een `.env.local` bestand en gebruik onderstaande variabelen.

```env
APPOINTMENT_TIMEZONE=Europe/Brussels

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@ladeco-it.com

GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=
```

## Google Calendar sync instellen

1. Maak een service account in Google Cloud.
2. Activeer de Google Calendar API.
3. Deel de gewenste Google Agenda met het service-account e-mailadres.
4. Zet de drie Google variabelen in `.env.local`.

Als Google niet is geconfigureerd, werkt de rest nog steeds: de klantmail en .ics uitnodiging worden dan wel verstuurd.
