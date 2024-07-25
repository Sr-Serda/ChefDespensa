import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  View,
  Button,
} from 'react-native';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);

  // Obtém as receitas favoritas do armazenamento local
  async function getFavorites() {
    const favoritesStr = await AsyncStorage.getItem('favorites');
    if (favoritesStr === null) {
      return [];
    }

    const favoritesArr = JSON.parse(favoritesStr);
    setFavorites(favoritesArr);
  }

  // Remove uma receita dos favoritos
  function removeFromFavorites(receita) {
    const updatedFavorites = favorites.filter((fav) => fav._id !== receita._id);
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  }

  // Salva as receitas favoritas no armazenamento local
  function saveFavorites(favorites) {
    try {
       AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  useEffect(() => {
    getFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {favorites.map((receita) => (
          <View key={receita._id}>
            <Text>{receita.nome}</Text>
            <Button
              title="Remover dos favoritos"
              onPress={() => removeFromFavorites(receita)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default FavoritesScreen;
