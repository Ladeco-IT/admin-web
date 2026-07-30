# Installatiegids voor Windows Server

Deze applicatie (admin-web) is gebouwd met Next.js en vormt de basis voor je administratie en toekomstige koppelingen met Accountable en een Flutter app.

## Benodigdheden

1.  **Node.js**: Zorg ervoor dat de LTS versie van [Node.js](https://nodejs.org/) op de Windows Server is geïnstalleerd.
2.  **Git**: Installeer [Git voor Windows](https://git-scm.com/download/win) of kopieer de bestanden handmatig.
3.  **PM2**: Dit is een process manager voor Node.js applicaties. Installeer deze globaal via de command line (cmd of powershell):
    ```bash
    npm install -g pm2
    ```

## Installatiestappen

1.  **Kopieer de bestanden**: Zet deze projectmap (`admin-web`) op de gewenste locatie op de server (bijv. `C:\inetpub\admin-web` of `C:\apps\admin-web`).
2.  **Open een terminal (als administrator)**: Navigeer naar de projectmap.
3.  **Installeer afhankelijkheden**:
    ```bash
    npm install
    ```
4.  **Omgevingsvariabelen instellen**:
    *   Maak een bestand genaamd `.env.local` aan in de hoofdmap (als deze nog niet bestaat).
    *   Kopieer de variabelen uit `.env.example` en vul de juiste waarden in (ADMIN_PASSWORD, SMTP_PASS, etc.).
    *   Voor pc-builder synchronisatie: stel ook `PC_CATALOG_SYNC_TOKEN` in. Dit token wordt gebruikt door de publieke website om veilig `/api/pc-catalog` op te halen zonder gebruikerslogin.
5.  **Applicatie bouwen**:
    ```bash
    npm run build
    ```
6.  **Applicatie starten met PM2**:
    PM2 zorgt ervoor dat je app blijft draaien, zelfs na een crash of server reboot. In het project is een `ecosystem.config.js` aanwezig.
    ```bash
    pm2 start ecosystem.config.js
    ```
7.  **PM2 instellen op opstarten met Windows**:
    ```bash
    npm install pm2-windows-startup -g
    pm2-startup install
    pm2 save
    ```

## Toekomstige integraties

## PC-catalogus synchronisatie

1.  Open de nieuwe beheerpagina op `/pc-catalog` en onderhoud daar onderdelen, prijzen en foto-links.
2.  Stel op deze admin server `PC_CATALOG_SYNC_TOKEN` in (bijv. een lange random string).
3.  Stel op de publieke website dezelfde token in als `PC_CATALOG_SYNC_TOKEN`.
4.  Stel op de publieke website `PC_CATALOG_SYNC_URL` in naar deze endpoint, bv. `https://jouwdomein-admin.be/api/pc-catalog`.

*   **Accountable (Offertes en Facturen)**: Via de Accountable API kunnen we offertes en facturen ophalen en tonen in dit dashboard of direct linken aan afspraken. We moeten hiervoor de API documentatie van Accountable raadplegen en de authenticatiesleutels toevoegen aan ons `.env.local` bestand.
*   **Flutter App**: De Flutter app zal communiceren met deze server (bijv. via de `/api/...` routes). We kunnen eventueel nieuwe API-routes toevoegen specifiek voor de mobiele app om data te raadplegen of acties (zoals nieuwe afspraken toevoegen) uit te voeren. Zorg ervoor dat de server bereikbaar is (firewall configureren voor de gebruikte poort) en gebruik bij voorkeur een SSL certificaat (HTTPS) voor veilige communicatie, zeker met mobiele apps.
