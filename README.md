# Flair Dashboard

A custom web dashboard for monitoring and controlling your [Flair](https://www.flair.co/) smart home HVAC system. Built as a faster, more information-dense alternative to the official Flair app.

## What it does

**Home overview**
- Lists all your Flair structures (homes) with their current mode and set point

**Structure view**
- Live weather and outdoor conditions for your home's location
- System controls — switch between Auto/Manual mode and Cool/Heat
- Set point adjustment with hold options (1h, 2h, 4h, until tonight)
- Active schedule display

**Room cards**
- Current temperature and humidity per room (from Puck or Puck2 sensor)
- Room set point adjustment (requires Manual mode)
- Active/Inactive toggle — deactivating a room closes its vents
- Drag and drop to reorder rooms (order saved per home)
- Expandable device section showing:
  - Mini-split / AC unit controls (power, temperature, mode, fan speed) via Puck2
  - Individual vent open percentage (0 / 25 / 50 / 75 / 100%)

**Also shown when available**
- Thermostats with set point and mode control
- Remote sensors (temperature and humidity)
- Active alerts
- Schedule list

## Features

- Dark and light mode (preference saved across sessions)
- Temperature unit toggle °F / °C
- Optimistic updates — controls feel instant, roll back on error
- Skeleton loading states while data fetches

## Access

Open the dashboard at: *(add your URL here)*

Log in with your Flair account credentials when prompted.
