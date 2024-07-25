import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';

import { auth } from '../firebase'; // Importa o módulo de autenticação do Firebase
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/core';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import _ from 'lodash'; // Importa a biblioteca lodash

import data from '../output.json'; // Importa dados de um arquivo JSON local
import Icon from 'react-native-vector-icons/FontAwesome';
import useLoadFonts from '../useLoadFonts';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do handler para notificações push
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
  const [dados, setDados] = useState([]); // Estado para armazenar dados da tela
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [modalReceita, setModalReceita] = useState(null); // Estado para armazenar detalhes de uma receita no modal
  const [showClearButton, setShowClearButton] = useState(false); // Estado para controlar a exibição do botão de limpar pesquisa
  const [filtro, setFiltro] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento da tela
  const logo = {
    uri: 'https://i.postimg.cc/kgjk1Hff/100a3f3d6518e0ce8c08f25594574c33.png',
  };

  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (receita) => {
    if (isFavorite(receita)) {
      removeFromFavorites(receita);
    } else {
      addToFavorites(receita);
    }
  };

  const addToFavorites = async (receita) => {
    const updatedFavorites = [...favorites, receita];
    setFavorites(updatedFavorites);
    await saveFavorites(updatedFavorites);
  };

  const removeFromFavorites = async (receita) => {
    const updatedFavorites = favorites.filter(
      (fav) => fav._id.$oid !== receita._id.$oid
    );
    setFavorites(updatedFavorites);
    await saveFavorites(updatedFavorites);
  };

  const isFavorite = (receita) => {
    return favorites.some((fav) => fav._id.$oid === receita._id.$oid);
  };

  const handleFavoritePress = (receita) => {
    // Adiciona a receita ao estado `favorites`
    const updatedFavorites = favorites.concat([receita]);
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);

    // Navega para a tela de favoritos
  };

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Função para obter receitas aleatórias
  const getRandomRecipes = () => {
    const allRecipes = data.Receitas;
    const shuffledRecipes = _.shuffle(allRecipes);

    // Filtra receitas com ingredientes ou método de preparo não vazios
    const nonEmptyRecipes = shuffledRecipes.filter((receita) => {
      const hasNonEmptyIngredients = receita.secao.some(
        (sec) => sec.nome === ' Ingredientes' && sec.conteudo.length > 0
      );
      const hasNonEmptyPreparation = receita.secao.some(
        (sec) => sec.nome === ' Modo de Preparo' && sec.conteudo.length > 0
      );

      return hasNonEmptyIngredients || hasNonEmptyPreparation;
    });

    // Usa um Set para armazenar nomes de receitas exclusivos
    const uniqueRecipeNames = new Set();
    const uniqueNonEmptyRecipes = nonEmptyRecipes.filter((receita) => {
      if (!uniqueRecipeNames.has(receita.nome)) {
        uniqueRecipeNames.add(receita.nome);
        return true;
      }
      return false;
    });

    setDados(uniqueNonEmptyRecipes.slice(0, 20));
    setLoading(false);
  };

  useEffect(() => {
    getRandomRecipes(); // Obtém receitas aleatórias ao carregar a tela
  }, []);

  useEffect(() => {
    // Esta função é executada assim que o componente é montado.

    // Chama a função para registrar notificações push e, após a conclusão, define o token no estado.
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // Adiciona um ouvinte para receber notificações e atualiza o estado quando uma notificação é recebida.
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Adiciona um ouvinte para receber respostas a notificações e imprime as respostas no console.
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // Esta função de retorno será executada quando o componente for desmontado.
    return () => {
      // Remove os ouvintes de notificações para evitar vazamentos de memória.
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

 const handleSearch = (text) => {
  const inputValueLower = text.toLowerCase();
  setFiltro(inputValueLower);
  setModalReceita(null);

  const filteredRecipes = data.Receitas.filter((receita) => {
    // Check if the recipe name contains the search text
    const nameMatches = receita.nome.toLowerCase().includes(inputValueLower);

    // Check if the ingredients or preparation method are not empty
    const hasNonEmptyIngredients = receita.secao.some(
      (sec) => sec.nome === ' Ingredientes'  && sec.conteudo.length > 0
    );
    const hasNonEmptyPreparation = receita.secao.some(
      (sec) => sec.nome === ' Modo de Preparo' && sec.conteudo.length > 0
    );

    return nameMatches == (hasNonEmptyIngredients || hasNonEmptyPreparation);
  });

  // Use a Set to store unique recipe names
  const uniqueRecipeNames = new Set();
  const uniqueFilteredRecipes = filteredRecipes.filter((receita) => {
    if (!uniqueRecipeNames.has(receita.nome)) {
      uniqueRecipeNames.add(receita.nome);
      return true;
    }
    return false;
  });

  setDados(uniqueFilteredRecipes.slice(0, 20));
  setInputValue(text);


    // Atualiza o estado para mostrar ou ocultar o botão de limpar
    setShowClearButton(text.length > 0);
  };

  // Função para abrir o modal com os detalhes da receita
  const openModal = (receita) => {
    setModalReceita(receita);
    setModalVisible(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalReceita(null);
    setModalVisible(false);
  };

  // Função para renderizar cada item na lista
  const renderItem = ({ item }) => {
    return (
      <View style={styles.pokemonList}>
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => openModal(item)}>
            <Text style={styles.nomeReceita}>{item.nome}</Text>
          </TouchableOpacity>
         
        </View>
      </View>
    );
  };

  // Função para agendar uma notificação push
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

  // Função assíncrona para registrar notificações push
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      // Configuração de um canal de notificação no Android, se aplicável.
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      // Verifica se o aplicativo está sendo executado em um dispositivo físico.
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        // Solicita permissões de notificação se ainda não estiverem concedidas.
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Obtém o token de notificação push do Expo.
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id',
        })
      ).data;
      console.log(token);
    }

    return token;
  }

  // Função para limpar o campo de pesquisa
  const clearSearchInput = () => {
    setInputValue('');
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.headerContainer}>
        <Image style={styles.logo} source={logo} />
        <Text style={styles.title}>Chef de Despensa</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pesquisar receitas"
          value={inputValue}
          onChangeText={handleSearch}
          onFocus={() => setShowClearButton(inputValue.length > 0)}
        />
        {showClearButton && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSearchInput}>
            <Text>
              <Icon name="close" size={25} color="red" />
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.underText}>
          Prepara o chapéu chef!{' '}
          <Text style={styles.underText2}>
            Caso esteja procurado por uma receita específica insira acima o nome
            da receita em que deseja.
          </Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={dados}
          keyExtractor={(item) => item._id.$oid}
          renderItem={renderItem}
        />
      )}

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

export default HomeScreen;

const styles = {
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: 'white'
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
    marginBottom: 10,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
  },
  clearButton: {
    position: 'absolute',
    top: '25%', // Ajusta a posição vertical relativa ao tamanho do TextInput
    right: '5%',
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
    marginTop: 15,
    marginHorizontal: 15,
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
    fontFamily: 'Poppins_Regular',
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
  underText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 1,
    marginBottom: 10,
    fontFamily: 'Exo_Bold',
    alignSelf: 'center',
    textAlign: 'justify',
    marginHorizontal: 10,
  },
  underText2: {
    color: 'black',
    fontSize: 14,
    marginTop: 1,
    marginLeft: 5,
    marginBottom: 10,
    fontFamily: 'Exo_Regular',
    alignSelf: 'center',
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
    width: 45,
    height: 45,
    marginHorizontal: 3,
    marginBottom: 9,
    margimLeft: 9,
  },
  input: {
    height: 60,
    width: '100%',
    borderColor: '#d9d9d9',
    borderWidth: 1,
    marginBottom: 8,
    paddingLeft: 8,
    borderRadius: 10,
  },
  searchIcon: {
    position: 'absolute',
    right: 30,
    top: 155,
  },
};
