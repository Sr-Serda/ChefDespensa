import { useCallback } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from "expo-font";
import { Exo_400Regular, Exo_700Bold} from '@expo-google-fonts/exo';

const useLoadFonts = () => {
    const [fontsLoaded] = useFonts({
        'Exo_Regular': Exo_400Regular,
        'Exo_Bold': Exo_700Bold
      });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    return { fontsLoaded, onLayoutRootView };
}

export default useLoadFonts;