# Jabarin

**Connecting citizens with public services.**

Jabarin is a mobile app designed to connect citizens with government services in one accessible platform. It brings together public issue reporting, feedback, report tracking, and information about essential public services.

The project is currently in development, with an initial focus on the mobile interface and navigation.

## Features and Services

Jabarin aims to provide access to:

- **Public Reporting** — report public issues, share feedback, and track progress.
- **Civil Registration** — find information about identity documents and population administration.
- **Healthcare** — explore public healthcare facilities and services.
- **Property Tax** — access information about land and building tax (PBB).
- **Business Permits** — find information about business registration (NIB).
- **Service Queues** — access public service queue information.
- **Social Assistance** — explore available assistance programs.
- **Digital Identity** — access information about Digital Population Identity (IKD).

## Built With

- React Native
- Expo
- TypeScript
- NativeWind
- Expo Router

## Getting Started

### Prerequisites

Install the following on your computer:

- Node.js — an LTS version compatible with the project's Expo SDK
- npm
- A code editor, such as Visual Studio Code

For mobile preview, use either:

- **Expo Go** on a physical Android or iOS device
- **Android Emulator** through Android Studio
- **iOS Simulator** through Xcode on macOS

### 1. Clone the Repository

```bash
git clone https://github.com/jyowl/jabarin-app.git
cd jabarin-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npx expo start
```

Keep this terminal running while developing.

### 4. Open the App

**On a physical device**

Connect your computer and phone to the same Wi-Fi network. Open Expo Go and scan the QR code shown in the terminal. On iPhone, you can scan it using the Camera app.

**On Android Emulator**

Start your virtual device from Android Studio's Device Manager, then press `a` in the Expo terminal.

**On iOS Simulator**

Start the simulator on macOS, then press `i` in the Expo terminal.

**In a web browser**

Press `w` in the Expo terminal.

## Development

The main application files are organized as follows:

```text
jabarin-app/
├── assets/
│   └── images/          # Images and illustrations
├── src/
│   ├── app/             # Pages and navigation layouts
│   └── components/      # Reusable interface components
├── app.json             # Expo configuration
├── global.css           # NativeWind stylesheet
└── tailwind.config.js   # Tailwind configuration
```

Edit files inside `src/app` and `src/components`, then save your changes to update the preview.

Useful Expo terminal shortcuts:

| Key | Action |
| --- | --- |
| `a` | Open on Android |
| `i` | Open on iOS Simulator |
| `w` | Open in a web browser |
| `r` | Reload the app |
| `Ctrl+C` | Stop the development server |

## Troubleshooting

If the preview does not reflect your latest changes, restart Expo with its cache cleared:

```bash
npx expo start --clear
```

If you see an “Unable to resolve” error, check that the referenced file exists and its path, filename, and extension match the import.