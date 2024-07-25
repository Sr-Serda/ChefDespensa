import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
  {
    key: '1',
   
     image: require('../assets/LoginPageWireframeMobileUIPrototype.png'),
    backgroundColor: '#3395ff',
  },
  {
    key: '2',
   
    image: require('../assets/LoginPageWireframeMobileUIPrototype(1).png'),
    backgroundColor: '#febe29',
  },
  {
    key: '3',
   
   image: require('../assets/LoginPageWireframeMobileUIPrototype(2).png'),
    backgroundColor: '#652d90',
  },
];
 
const WelcomeScreen = ({ navigation }) =>  {
  const [showRealApp, setShowRealApp] = useState(false);
 
  const onDone = () => {
     navigation.replace('Login');
  };
  const onSkip = () => {
    navigation.replace('Login');
  };
 
 const renderItem = ({ item }) => {
  return (
    <View
      style={{
        flex: 1,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
    >
      <Text style={styles.introTitleStyle}>{item.title}</Text>
      <Image
        style={styles.fullScreenImage}
        source={item.image}
        resizeMode="cover" // Adicionado resizeMode para preencher a tela sem distorção
      />
      <Text style={styles.introTextStyle}>{item.text}</Text>
    </View>
  );
};
  return (
    <>
      {showRealApp ? (
        <SafeAreaView style={styles.container}>
          <View style={styles.container}>
            <Text style={styles.titleStyle}>
              Tela Principal do Aplicativo
            </Text>
            <Text style={styles.paragraphStyle}>
              Esta é a tela principal que será mostrada ao clicar em Ignorar ou no botão Concluído
            </Text>
            <Button
              title="Mostrar Intro Slider novamente"
              onPress={() => setShowRealApp(false)}
            />
          </View>
        </SafeAreaView>
      ) : (
        <AppIntroSlider
          data={slides}
          renderItem={renderItem}
          onDone={onDone}
          showSkipButton={true}
          onSkip={onSkip}
        />
      )}
    </>
  );
};


 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },
  titleStyle: {
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  fullScreenImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  paragraphStyle: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
  },
 
  introTextStyle: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    paddingVertical: 30,
  },
  introTitleStyle: {
    fontSize: 25,
    color: 'black',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
