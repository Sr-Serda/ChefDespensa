 import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image,} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginScreen from './components/IngredienteScreen';
import IngredienteScreen  from './components/IngredienteScreen';
import RegisterScreen from './components/RegisterScreen';
import HomeScreen from './components/Homescreen';
import AboutUsScreen from './components/AboutUsScreen';
import RankingScreen from './components/RankingScreen';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/core';

import WelcomeScreen from './components/WelcomeScreen';

import FavoritesScreen from './components/FavoritesScreen'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import useLoadFonts from './useLoadFonts';
import { auth } from './firebase';
import {
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
} from 'react-native';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const BottomTab = createMaterialBottomTabNavigator();
  // Adicionei a criação do Tab Navigator


export default function App() {
  const { fontsLoaded, onLayoutRootView } = useLoadFonts();

  if (!fontsLoaded) return null;
  


  const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');

   useEffect(() => {
    checkFirstTimeLogin();
  }, );

    const checkFirstTimeLogin = async () => {
  try {
    const isFirstTimeLogin = await AsyncStorage.getItem('firstTimeLogin');

    if (!isFirstTimeLogin) {
      // Se for a primeira vez, navegue para a tela de boas-vindas
      navigation.replace('Welcome');
      // Marque que o usuário já viu a tela de boas-vindas
      await AsyncStorage.setItem('firstTimeLogin', 'true');
    }
  } catch (error) {
    console.error('Error checking first time login:', error);
  }
};


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.emailVerified) {
          // Email verificado, permitir login
          navigation.navigate('Home');
        } 
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleSignUp = () => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        user.sendEmailVerification()
          .then(() => {
            console.log('Registered with:', user.email);
            alert("Por favor, verifique seu email antes de fazer login.");
          })
          .catch((error) => {
            alert(error.message);
          });
      })
      .catch((error) => alert(error.message));
  };

  const handleLogin = () => {
  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      // Successful login, redirect to home screen
      navigation.navigate('Home');
    })
    .catch((error) => {
      const errorCodes = ['auth/wrong-password', 'auth/invalid-email'];

      if (errorCodes.includes(error.code)) {
        if (error.code === 'auth/wrong-password') {
          setErrorText('A senha está errada. Por favor, verifique sua senha.');
        } else if (error.code === 'auth/invalid-email') {
          setErrorText('O email não é válido. Por favor, digite um email válido.');
        }
      } else {
        setErrorText('Algo está errado, tente novamente'); // Display generic error message for other errors
      }
    });
};


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inputContainer} onLayout={onLayoutRootView}>
        <Image style={styles.logo} source={require('./chef2.png')} />
        <Text style={styles.underText}>Ei Chef, conecte-se!</Text>
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={[styles.button, styles.buttonOutline]}>
            <Text style={styles.buttonOutlineText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

const HomeTabScreen = () => {
  return (
    <BottomTab.Navigator
      labeled="true"
      activeColor="black"
      inactiveColor="#FE0000"
      barStyle={{ backgroundColor: 'white' }}
      labelStyle={{ color: 'green' }}>
     
      <BottomTab.Screen
        name="Propostas"
        component={AboutUsScreen}
        options={{
          headerShown:false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="handshake" color={color} size={26} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Início"
        component={HomeScreen}
        options={{
          headerShown:false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chef-hat" color={color} size={26} />
          ),
        }}
      />
     

       <BottomTab.Screen
        name="Ingredientes"
        component={IngredienteScreen}
        options={{
          headerShown:false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="plus" color={color} size={26} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Ranking"
        component={RankingScreen}
        options={{
          headerShown:false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" color={color} size={26} />
          ),
        }}
      />
     
    </BottomTab.Navigator>
  );
};

 return (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
  name="Home"
  component={HomeTabScreen}
  options={{
    headerShown: false,
  }}
/>
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            headerShown: false,
          }}
        />
       
    </Stack.Navigator>
  </NavigationContainer>
);
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
            paddingTop: Constants.statusBarHeight,
  },
  inputContainer: {
    width: '80%',
            paddingTop: Constants.statusBarHeight,

  },
  input: {
    backgroundColor: '#EFEAEA',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 1,
  },
  
  button: {
    backgroundColor: '#FE0000',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#FE0000',
    borderWidth: 2,
  },
  errorText: {
  color: 'red',
  marginTop: 10,
  textAlign: 'center',
    fontWeight: 'bold', // Adicionando negrito para destacar a mensagem

},
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#FE0000',
    fontWeight: '700',
    fontSize: 16,
  },
  logo: {
    alignSelf: 'center',
    margin: 30,
  },
  underText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 1,
    marginBottom:10,
    fontFamily: 'Exo_Regular',
    alignSelf: 'center',
  },
});

