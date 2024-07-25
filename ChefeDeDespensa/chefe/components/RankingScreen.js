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
  Image 
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

// Configuração do handler para notificações push
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const RankingScreen = ({ navigation }) => {
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

  // Função para obter receitas aleatórias
  const getRandomRecipes = () => {
    const allRecipes = data.Receitas;
    const shuffledRecipes = _.shuffle(allRecipes);

    // Filtra receitas com ingredientes ou método de preparo não vazios
    const nonEmptyRecipes = shuffledRecipes.filter((receita) => {
      const hasNonEmptyIngredients = receita.secao.some(sec => sec.nome === " Ingredientes" && sec.conteudo.length > 2);
      const hasNonEmptyPreparation = receita.secao.some(sec => sec.nome === " Modo de Preparo" && sec.conteudo.length > 2);

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

    setDados(uniqueNonEmptyRecipes.slice(0, 3));
    setLoading(false);
  };

 useEffect(() => {
  const recipesToDisplay = data.Receitas.filter((receita) => {
    const recipeNamesToDisplay = [
      "Batata frita super crocante",
      "Bolo ninho de páscoa",
      "Burrito fácil"
    ];

    return recipeNamesToDisplay.includes(receita.nome);
  });

  setDados(recipesToDisplay);
  setLoading(false);
}, []);


  useEffect(() => {
    // Esta função é executada assim que o componente é montado.

    // Chama a função para registrar notificações push e, após a conclusão, define o token no estado.
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Adiciona um ouvinte para receber notificações e atualiza o estado quando uma notificação é recebida.
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Adiciona um ouvinte para receber respostas a notificações e imprime as respostas no console.
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    // Esta função de retorno será executada quando o componente for desmontado.
    return () => {
      // Remove os ouvintes de notificações para evitar vazamentos de memória.
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Função para lidar com a pesquisa de receitas
  const handleSearch = (text) => {
    const inputValueLower = text.toLowerCase();
    setFiltro(inputValueLower);
    setModalReceita(null);

    const filteredRecipes = data.Receitas.filter((receita) => {
      // Verifica se o nome da receita contém o texto de pesquisa
      const nameMatches = receita.nome.toLowerCase().includes(inputValueLower);

      // Verifica se os ingredientes ou o método de preparo não estão vazios
      const hasNonEmptyIngredients = receita.secao.some(sec => sec.nome === " Ingredientes" && sec.conteudo.length > 2);
      const hasNonEmptyPreparation = receita.secao.some(sec => sec.nome === " Modo de Preparo" && sec.conteudo.length > 2);

      return nameMatches && (hasNonEmptyIngredients || hasNonEmptyPreparation);
    });

    // Usa um Set para armazenar nomes de receitas exclusivos
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
   const renderItem = ({ item, index }) => {
    // Determine a cor da estrela com base no índice
    let starColor = '';
    if (index === 0) {
      starColor = 'gold';
    } else if (index === 1) {
      starColor = 'silver';
    } else if (index === 2) {
      starColor = 'brown';
    }

    return (
      <View style={styles.pokemonList}>
        <View style={styles.card}>
          {/* Adicione o ícone de estrela no canto superior direito */}
          {starColor && (
            <Icon
              name="star"
              size={20}
              color={starColor}
              style={styles.starIcon}
            />
          )}
          <TouchableOpacity onPress={() => openModal(item) + schedulePushNotification()}>
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
        title: "Sua jornada começou!!! 🍽️",
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
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        // Solicita permissões de notificação se ainda não estiverem concedidas.
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Obtém o token de notificação push do Expo.
      token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Função para limpar o campo de pesquisa
  const clearSearchInput = () => {
    setInputValue('');
  };

  

  return (
<View style={[styles.container, styles.backgroundImage]} onLayout={onLayoutRootView}>
      <View style={styles.headerContainer}>
        <Image style={styles.logo} source={logo} />
        <Text style={styles.title}>Chef de Despensa</Text>
      </View>

      <View style={{flexDirection:'row', }}>
      <Text style={styles.underText2}>Aqui você encontra as{' '}
      
      <Text style={styles.underText}>receitas premiadas{' '}</Text>

      <Text style={styles.underText2}>de acordo com o favoritismo do público!{' '}</Text>
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
}

export default RankingScreen;

const styles =({
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
  backgroundImage: {
  flex: 1,
  resizeMode: 'cover',
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
  inputContainer: {
    flexDirection: 'row',
  },
  clearButton: {
    padding: 8,
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
  underText: {
   color: 'black',
    fontSize: 14,
    marginTop: 1,
    marginLeft: 5,
    marginBottom: 10,
    fontFamily: 'Exo_Bold',
    alignSelf: 'center',
  },
  underText2: {
   color: 'black',
    fontSize: 14,
    marginTop: 1,
    marginBottom: 10,
    fontFamily: 'Exo_Regular',
    alignSelf: 'center',
    textAlign: 'justify',
    marginHorizontal: 10,

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
  starIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
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
  input: {
    height: 60,
    width:'90%',
    borderColor: 'red',
    borderWidth: 1,
    marginBottom: 8,
    paddingLeft: 8,
    borderRadius:10
  },
  searchIcon: {
  position: 'absolute',
  right: 30,
  top: 155,
},
})
