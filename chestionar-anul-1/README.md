# Chestionar pentru studenții din anul întâi

Aplicația conține întrebările S1–S10 din documentul sursă, plus sexul și anul promovării examenului de bacalaureat. Înregistrează automat data și ora fiecărui răspuns și afișează distribuțiile agregate într-un dashboard. Formularul nu solicită numele sau adresa de e-mail.

## Fișiere

- `index.html`, `styles.css`, `app.js` — aplicația care poate fi publicată pe GitHub Pages.
- `apps-script/Code.gs` — componenta care salvează răspunsurile într-o foaie Google Sheets și furnizează datele agregate dashboardului.

## Conectarea la Google Sheets

1. Creează o foaie Google Sheets nouă, de exemplu `Chestionar anul I`.
2. În foaie, deschide **Extensii → Apps Script**.
3. Șterge codul existent și copiază conținutul fișierului `apps-script/Code.gs`.
4. În prima parte a codului, înlocuiește `SCHIMBA-ACEASTA-PAROLA` cu o cheie privată pentru dashboard.
5. Rulează o singură dată funcția `setup` și acceptă permisiunile solicitate. Se va crea fila `Raspunsuri`.
6. Alege **Deploy → New deployment → Web app**.
7. La **Execute as**, alege contul tău. La **Who has access**, alege `Anyone` pentru ca studenții să poată trimite răspunsuri fără autentificare.
8. Copiază URL-ul care se termină în `/exec`.
9. În `app.js`, înlocuiește linia `const API_URL = "";` cu URL-ul copiat.

Nu publica cheia dashboardului în `app.js`. Cheia rămâne numai în Apps Script și este introdusă manual când deschizi dashboardul.

## Publicarea pe GitHub Pages

Încarcă în repository fișierele `index.html`, `styles.css` și `app.js`. În setările repository-ului, activează GitHub Pages pentru ramura și directorul în care se află aceste fișiere.

## Testare înainte de primul curs

1. Completează formularul o dată de pe telefon și o dată de pe calculator.
2. Verifică apariția celor două rânduri în fila `Raspunsuri` din Google Sheets.
3. Deschide secțiunea Dashboard, introdu cheia și verifică totalurile.
4. Șterge rândurile de test din foaie, păstrând primul rând cu denumirile coloanelor.

## Mod demonstrativ

Cât timp `API_URL` este gol, răspunsurile sunt păstrate numai în browserul curent. Acest mod permite verificarea interfeței și a dashboardului, dar nu centralizează răspunsurile studenților.
