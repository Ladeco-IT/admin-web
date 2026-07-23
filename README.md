# Ladeco IT Admin

Admin portaal om afspraken in te plannen voor klanten.

## Functionaliteit

- Dashboard is afgeschermd met admin login.
- Admin vult naam, e-mail, adres, reden, datum en uur in.
- API valideert invoer server-side.
- Elke afspraak wordt lokaal opgeslagen in een JSON datastore.
- Admin ziet een overzicht van alle gemaakte afspraken.
- Per afspraak kan de admin markeren of die voltooid is.
- Per afspraak kan de admin een .ics bestand downloaden om die in de eigen agenda te zetten.
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

ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=info@ladeco-it.com

GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_CALENDAR_ID=
```

## Admin login

Stel minstens `ADMIN_USERNAME`, `ADMIN_PASSWORD` en `ADMIN_SESSION_SECRET` in om de admin login te activeren.

- `ADMIN_USERNAME`: loginnaam voor de admin.
- `ADMIN_PASSWORD`: wachtwoord voor de admin.
- `ADMIN_SESSION_SECRET`: willekeurige geheime sleutel om sessiecookies te ondertekenen.

## Google Calendar sync instellen

1. Maak een service account in Google Cloud.
2. Activeer de Google Calendar API.
3. Deel de gewenste Google Agenda met het service-account e-mailadres.
4. Zet de drie Google variabelen in `.env.local`.

Als Google niet is geconfigureerd, werkt de rest nog steeds: de klantmail en .ics uitnodiging worden dan wel verstuurd.

## Opslag

De afspraken worden lokaal bijgehouden in `data/appointments.json`.
