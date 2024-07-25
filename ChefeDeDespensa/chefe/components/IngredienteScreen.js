import { useNavigation } from '@react-navigation/core'
import {Text,
  View,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image } from 'react-native'
import { auth } from '../firebase'
import Constants from 'expo-constants';

export const navigationRef = React.createRef();
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState, useRef} from 'react';
import _ from 'lodash'; // Importe a biblioteca lodash

import data from '../output.json';
import Icon from 'react-native-vector-icons/FontAwesome';
import useLoadFonts from '../useLoadFonts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HomeScreen = ({ navigation }) => {
  const { fontsLoaded, onLayoutRootView } = useLoadFonts();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [dados, setDados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReceita, setModalReceita] = useState(null);
  const [loading, setLoading] = useState(true);
  const logo = {
    uri: 'https://i.postimg.cc/kgjk1Hff/100a3f3d6518e0ce8c08f25594574c33.png',
  };
  const [noResults, setNoResults] = useState(false);

  const [inputValues, setInputValues] = useState(['', '', '', '', '']);

  

    const getRandomIngredients = () => {
    const allRecipes = data.Receitas;
    const shuffledRecipes = _.shuffle(0, 0);

    // Filtra receitas repetidas e com ingredientes e modo de preparo vazios
    const filteredRecipes = shuffledRecipes.filter((receita) => {
      const isNotRepeated = !dados.find((item) => item._id.$oid === receita._id.$oid);
      const hasNonEmptyIngredients = receita.secao.some((sec) => sec.nome === ' Ingredientes' && sec.conteudo.length > 2);
      const hasNonEmptyPreparation = receita.secao.some((sec) => sec.nome === ' Modo de Preparo' && sec.conteudo.length > 2);

      return isNotRepeated && (hasNonEmptyIngredients || hasNonEmptyPreparation);
    });

    setDados((prevData) => [...prevData, ...filteredRecipes]);
    setLoading(false);
  };

  useEffect(() => {
    getRandomIngredients();
  }, []);


  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

const handleSearch = () => {
  const inputs = inputValues.map((value) => value.toLowerCase());

  // Verifica se pelo menos três ingredientes foram fornecidos
  const validInputs = inputs.filter((input) => input.trim() !== '');
  if (validInputs.length < 3) {
    // Exiba uma mensagem ou realize a lógica apropriada quando menos de três ingredientes são fornecidos
    alert('Por favor, forneça pelo menos três ingredientes.');
    return;
  }

  setModalReceita(null);

  const filteredRecipes = data.Receitas.filter((receita) => {
    const ingredientesSecao = receita.secao.find((sec) => sec.nome === ' Ingredientes');
    if (!ingredientesSecao) {
      return false;
    }

    const ingredientes = ingredientesSecao.conteudo.map((conteudo) => conteudo.toLowerCase());

    // Verifica se todos os ingredientes fornecidos estão presentes na receita
    return inputs.every((input) => ingredientes.some((ingrediente) => ingrediente.includes(input)));
  });

  // Update the state with the results of the latest search
  setDados(filteredRecipes);

  if (filteredRecipes.length === 0) {
    setNoResults(true);
  } else {
    setNoResults(false);
  }
};

 



  const openModal = (receita) => {
    setModalReceita(receita);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalReceita(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.pokemonList}>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => openModal(item)}>
            <Text style={styles.nomeReceita}>{item.nome}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  function schedulePushNotification() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sua jornada começou!!! 🍽️',
        body: 'Comece já sua receita!',
        data: { data: 'goes here' },
      },
      trigger: {
        seconds: 10,
      },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      
      token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
      console.log(token);
    } 

    return token;
  }

  const handleInputChange = (index, text) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = text
      .split(',')
      .map((ingredient) => ingredient.trim())
      .filter(Boolean) // Remove strings vazias (caso haja espaços extras após a vírgula)
      .join(','); // Garante que há apenas uma vírgula entre os ingredientes
    setInputValues(newInputValues);
  };

  const addIngredientInput = () => {
    if (inputValues.length < 10) {
      setInputValues([...inputValues, '']);
    }
  };
  const clearIngredientInput = (index) => {
  const newInputValues = [...inputValues];
  newInputValues[index] = '';
  setInputValues(newInputValues);
};

  return (
    
    <View style={styles.container} onLayout={onLayoutRootView}>
    <ScrollView>
      <View style={styles.headerContainer}>
        <Image style={styles.logo} source={logo} />
        <Text style={styles.title}>Chef de Despensa</Text>
      </View>
      <View style={{flexDirection:'row', }}>
      <Text style={styles.underText}>Que tal colocar a mão na massa?{' '}
      
      <Text style={styles.underText2}>Insira abaixo os ingredientes que você possui e selecionaremos receitas para você! </Text>
      </Text>
      
      </View>
      {inputValues.map((value, index) => (
  <View key={index} style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      placeholder={`Ingrediente`}
      value={value}
      onChangeText={(text) => handleInputChange(index, text)}
    />
    {value !== '' && (
      <TouchableOpacity style={styles.clearIcon} onPress={() => clearIngredientInput(index)}>
        <Icon name="times" size={20} color="red" />
      </TouchableOpacity>
    )}
  </View>
))}
       <View style={{flexDirection:'row', }}>
      <TouchableOpacity style={styles.addButton} onPress={addIngredientInput}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
        <Text>
          <Icon name="search" size={25} color="white" />
        </Text>
      </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : noResults ? (
        <Text style={styles.noResultsText}>Nenhuma receita encontrada. Tente ajustar os ingredientes.</Text>
      ) : (
        <FlatList data={dados} keyExtractor={(item) => item._id.$oid} renderItem={renderItem} />
      )}
          </ScrollView>

      {modalReceita && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}>
          <ScrollView>
            <View style={styles.centeredView}>
              <View style={styles.cardModal}>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.fecharModal}>Fechar</Text>
                </TouchableOpacity>
                <Text style={styles.nomeReceitaModal}>{modalReceita.nome}</Text>
                {modalReceita.secao.map((sec, index) => (
                  <View key={index}>
                    <Text style={styles.sectionHeader}>{sec.nome}:</Text>
                    {sec.conteudo.map((conteudo, i) => (
                      <Text key={i} style={styles.listItem}>
                        {conteudo}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </Modal>
      )}
    </View>
    
  );
};

export default HomeScreen

const styles =({
  container: {
    flex: 1,
    padding: 16,
        paddingTop: Constants.statusBarHeight,
    backgroundColor:'white'
  },
  headerContainer: {
    flexDirection: 'row', // Coloca a logo e o título em uma linha
    alignItems: 'center', // Alinha o conteúdo verticalmente ao centro
    marginBottom: 16,
        paddingTop: Constants.statusBarHeight,

  },
  filterInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
  },
  searchButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom:10
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  underText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 1,
    marginBottom:10,
    fontFamily: 'Exo_Bold',
    alignSelf: 'center',
    textAlign:'justify',
    marginHorizontal:9
  },
  underText2: {
    color: 'black',
    fontSize: 14,
    marginTop: 1,
    marginLeft:5,
    marginBottom:10,
    fontFamily: 'Exo_Regular',
    alignSelf: 'center',
  },
 card: {
    flexDirection:'row',
    backgroundColor: '#EFEBEB',
    borderRadius: 10,
    width: '100%',
    padding: 16,
    marginBottom: 15,
    shadowColor: '#ff0000',
    alignSelf: 'center',
    alignItems: 'center'
  },
  cardModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    marginTop:15,
    marginHorizontal:15,
    shadowColor: '#ff0000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  cardModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    marginTop:15,
    marginHorizontal:15,
    shadowColor: '#ff0000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  nomeReceita: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
   nomeReceitaModal: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontFamily:'Poppins_Regular'
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 8,
        color: '#FE0000',
  },
  listItem: {
    fontSize: 12,
    marginVertical: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FE0000',
    alignSelf: 'center',
    marginLeft: 10,
  },
  fecharModal: {
    textAlign: 'center',
    fontSize: 16,
     fontWeight: 'bold',
    color: '#FE0000', // Cor para o link de fechar o modal
  },
  pokemonList: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor:'white'
  },
  verm: {
    borderColor: 'red',
    backgroundColor: 'red',
    borderWidth: 5,
    marginHorizontal: 30,
    alignItems: 'center',
    borderRadius: 10,
  },
   addButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    width:'47%',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft:3,
  },
  vermText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  suggestionContainer: {
    marginTop: 10,
    marginLeft: 10, // Adiciona margem à esquerda para as sugestões
  },
  suggestionText: {
    padding: 10,
    backgroundColor: 'lightgray',
    marginVertical: 5,
    borderRadius: 5,
  },
  noResultsText: {
    textAlign: 'center',
  },
   logo: {
    width:45,
    height:45,
    marginHorizontal:3,
    marginBottom: 9,
    margimLeft: 9
  },
  clearIcon: {
    position: 'absolute',
    top: 18,
    right: 15,
    zIndex: 1,
  },

  input: {
     height: 60,
    width:'100%',
    borderColor: '#d9d9d9',
    borderWidth: 1,
    marginBottom: 8,
    paddingLeft: 8,
    borderRadius:10,
    placeholderFontWeight:'bold'
  },
 searchIcon: {
    backgroundColor: 'red',
    padding: 10,
    marginLeft:15,
    width:'47%',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',  // Adicione esta linha para definir a cor da borda
},

})