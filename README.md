# Bottom tab bar disappears after rotating on iOS 26+

Minimal reproduction for a bug in `@react-navigation/bottom-tabs`: on iOS 26+,
rotating the device permanently hides the tab bar of any navigator that uses
`tabBarHideOnKeyboard`.

## Run it

```sh
npm install
npx expo run:ios
```

Use an iOS 26+ device or simulator. The app must be built (not Expo Go) because
the bug depends on the platform's keyboard notifications.

## Steps

1. Launch the app — the Home / Settings tab bar is visible.
2. Rotate the device to landscape.

**Actual:** the tab bar disappears and never comes back while the app stays in
that orientation. Tab navigation is impossible.

**Expected:** the tab bar stays visible.

## Why it happens

Each screen logs every keyboard notification it receives. Rotating produces:

```
willShow height=0
didShow  height=0
```

and **no matching hide**. iOS 26+ posts a keyboard *show* notification on every
interface rotation with an empty keyboard frame.

`useIsKeyboardShown` in bottom-tabs treats any show notification as a real
keyboard, so `isKeyboardShown` latches `true` and nothing clears it.
`BottomTabBar` then evaluates

```js
const shouldShowTabBar = !(tabBarHideOnKeyboard && isKeyboardShown);
```

as `false` and animates the bar off screen with `pointerEvents: 'none'` —
permanently, because the hide that would restore it never arrives.

`Keyboard.isVisible()` also returns `true` for these notifications, so it cannot
be used to tell them apart. The empty frame is the distinguishing signal.

## Removing `tabBarHideOnKeyboard` avoids it

Dropping `tabBarHideOnKeyboard` from `screenOptions` in `App.tsx` stops the tab
bar disappearing, which confirms the path. It is not a fix — it means the tab bar
no longer hides over a focused text input.

## Note on `enableSceneSupport`

`app.json` sets `ios.enableSceneSupport` through `expo-build-properties`. That is
unrelated to this bug: without it, an app built against the iOS 26+ SDK does not
adopt the UIScene lifecycle and UIKit refuses to launch it at all, so the
reproduction could not run.

## Environment

| package | version |
| --- | --- |
| @react-navigation/bottom-tabs | 7.19.2 |
| @react-navigation/native | 7.4.1 |
| react-native | 0.86.3 |
| expo | 57.0.24 |

Reproduced on an iPhone Duo simulator running iOS 27.1, Xcode 27.0. The
notification behaviour is the platform's, not the device's, so any rotating
iOS 26+ device should show it.
