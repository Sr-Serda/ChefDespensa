import React, { useState } from 'react';
import Checkbox from 'expo-checkbox';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { auth } from '../firebase';
import firebase from 'firebase';

const logo = {
  uri: 'https://i.postimg.cc/kgjk1Hff/100a3f3d6518e0ce8c08f25594574c33.png',
};

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReceita, setModalReceita] = useState(null);
  const [isChecked, setChecked] = useState(false);

  const isEmailValid = (email) => {
    // Expressão regular para validar o formato do email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

 const onRegisterPress = () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match.");
      return;
    }

    if (!isEmailValid(email)) {
      alert('Email is not valid.');
      return;
    }

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        const uid = user.uid; // Obtenha o UID do usuário autenticado
        console.log('Registered with:', user.email);

        // Envie um email de verificação para o usuário
        user
          .sendEmailVerification()
          .then(() => {
            // O email de verificação foi enviado com sucesso
            console.log('Email de verificação enviado.');
          })
          .catch((error) => {
            // Trate erros ao enviar o email de verificação
            console.error('Erro ao enviar o email de verificação:', error);
          });

        const data = {
          email,
          fullName,
        };

        // Use a regra acima para criar o documento
        firebase.firestore().collection('users').doc(uid).set(data);

        navigation.navigate('Login', { user: data });
      })
      .catch((error) => {
        alert(error);
      });
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inputContainer}>
        <Image style={styles.logo} source={logo} />
        <Text style={styles.underText}>Insira os seus dados e registre-se:</Text>
        <TextInput
          placeholder="Nome Completo"
          value={fullName}
          onChangeText={(text) => setFullName(text)}
          style={styles.input}
        />
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
        <TextInput
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          style={styles.input}
          secureTextEntry
        />
        <View style={{ flexDirection: 'row' }}>
          <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? '#FE0000' : undefined}
        />
          <Text style={styles.termos}>Lí e aceito os</Text>
          <Text style={styles.termoscard} onPress={() => setModalVisible()}>
            termos de uso e condições.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onRegisterPress}
          style={[styles.button, isChecked ? null : styles.disabledButton]}
          disabled={!isChecked} // Desativar o botão se o checkbox estiver desativado, demorei 30 mn nessa bosta
        >
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.underText}>
          <Text style={styles.underText2}>
            Já tem cadastro?
            <Text style={styles.loginText}> Clique aqui!</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <ScrollView>
          <View style={styles.centeredView}>
            <View style={styles.cardModal}>
              
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                Termos e condições gerais de uso do aplicativo Chef de Despensa
                Os serviços do Chef de Despensa são fornecidos pela pessoa
                física com a seguinte Razão Social: "RevenuesCook Chef S.A", com
                nome fantasia Chef de Despensa, inscrito no CPF sob o nº
                557100068-66, titular da propriedade intelectual sobre software,
                website, aplicativos, conteúdos e demais ativos relacionados à
                plataforma Chef de Despensa:{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                1. Do objeto A plataforma visa licenciar o uso de seu software,
                website, aplicativos e demais ativos de propriedade intelectual,
                fornecendo ferramentas para auxiliar e dinamizar o dia a dia dos
                seus usuários. A plataforma caracteriza-se pela prestação do
                seguinte serviço: Fornecer receitas com base nos ingredientes em
                que os utilizadores possuem em suas casas.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                2. Da aceitação O presente Termo estabelece obrigações
                contratadas de livre e espontânea vontade, por tempo
                indeterminado, entre a plataforma e as pessoas físicas ou
                jurídicas, usuárias do site ou aplicativo. Ao utilizar a
                plataforma o usuário aceita integralmente as presentes normas e
                compromete-se a observá-las, sob o risco de aplicação das
                penalidade cabíveis. A aceitação do presente instrumento é
                imprescindível para o acesso e para a utilização de quaisquer
                serviços fornecidos pela empresa. Caso não concorde com as
                disposições deste instrumento, o usuário não deve utilizá-los.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                3. Do acesso dos usuários Serão utilizadas todas as soluções
                técnicas à disposição do responsável pela plataforma para
                permitir o acesso ao serviço 24 (vinte e quatro) horas por dia,
                7 (sete) dias por semana. No entanto, a navegação na plataforma
                ou em alguma de suas páginas poderá ser interrompida, limitada
                ou suspensa para atualizações, modificações ou qualquer ação
                necessária ao seu bom funcionamento.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                4. Do cadastro O acesso às funcionalidades da plataforma exigirá
                a realização de um cadastro prévio e, a depender dos serviços ou
                produtos escolhidos, o pagamento de determinado valor. Ao se
                cadastrar o usuário deverá informar dados completos, recentes e
                válidos, sendo de sua exclusiva responsabilidade manter
                referidos dados atualizados, bem como o usuário se compromete
                com a veracidade dos dados fornecidos. O usuário se compromete a
                não informar seus dados cadastrais e/ou de acesso à plataforma a
                terceiros, responsabilizando-se integralmente pelo uso que deles
                seja feito. Menores de 18 anos e aqueles que não possuírem plena
                capacidade civil deverão obter previamente o consentimento
                expresso de seus responsáveis legais para utilização da
                plataforma e dos serviços ou produtos, sendo de responsabilidade
                exclusiva dos mesmos o eventual acesso por menores de idade e
                por aqueles que não possuem plena capacidade civil sem a prévia
                autorização. Mediante a realização do cadastro o usuário declara
                e garante expressamente ser plenamente capaz, podendo exercer e
                usufruir livremente dos serviços e produtos. O usuário deverá
                fornecer um endereço de e-mail válido, através do qual o site
                realizará todas comunicações necessárias. Após a confirmação do
                cadastro, o usuário possuirá um login e uma senha pessoal, a
                qual assegura ao usuário o acesso individual à mesma. Desta
                forma, compete ao usuário exclusivamente a manutenção de
                referida senha de maneira confidencial e segura, evitando o
                acesso indevido às informações pessoais. Toda e qualquer
                atividade realizada com o uso da senha será de responsabilidade
                do usuário, que deverá informar prontamente a plataforma em caso
                de uso indevido da respectiva senha. Não será permitido ceder,
                vender, alugar ou transferir, de qualquer forma, a conta, que é
                pessoal e intransferível. Caberá ao usuário assegurar que o seu
                equipamento seja compatível com as características técnicas que
                viabilize a utilização da plataforma e dos serviços ou produtos.
                O usuário poderá, a qualquer tempo, requerer o cancelamento de
                seu cadastro junto ao aplicativo Chef de Despensa. O seu
                descadastramento será realizado o mais rapidamente possível,
                desde que não sejam verificados débitos em aberto. O usuário, ao
                aceitar os Termos e Política de Privacidade, autoriza
                expressamente a plataforma a coletar, usar, armazenar, tratar,
                ceder ou utilizar as informações derivadas do uso dos serviços,
                do site e quaisquer plataformas, incluindo todas as informações
                preenchidas pelo usuário no momento em que realizar ou atualizar
                seu cadastro, além de outras expressamente descritas na Política
                de Privacidade que deverá ser autorizada pelo usuário.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                5. Do cancelamento O usuário poderá cancelar a contratação dos
                serviços de acordo com os termos que forem definidos no momento
                de sua contratação. Ainda, o usuário também poderá cancelar os
                serviços em até 7 (sete) dias após a contratação, mediante
                contato com o Chef de Despensa, de acordo com o Código de Defesa
                do Consumidor (Lei no. 8.078/90). O serviço poderá ser cancelado
                por: a) parte do usuário: nessas condições os serviços somente
                cessarão quando concluído o ciclo vigente ao tempo do
                cancelamento; b) violação dos Termos de Uso: os serviços serão
                cessados imediatamente.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                6. Do suporte Em caso de qualquer dúvida, sugestão ou problema
                com a utilização da plataforma, o usuário poderá entrar em
                contato com o suporte, através do telefone (11) 917428149. Estes
                serviços de atendimento ao usuário estarão disponíveis nos
                seguintes dias e horários: de segunda a sexta das 9h às 19h.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                7. Das responsabilidades É de responsabilidade do usuário: a)
                defeitos ou vícios técnicos originados no próprio sistema do
                usuário; b) a correta utilização da plataforma, dos serviços ou
                produtos oferecidos, prezando pela boa convivência, pelo
                respeito e cordialidade entre os usuários; c) pelo cumprimento e
                respeito ao conjunto de regras disposto nesse Termo de Condições
                Geral de Uso, na respectiva Política de Privacidade e na
                legislação nacional e internacional; d) pela proteção aos dados
                de acesso à sua conta/perfil (login e senha). É de
                responsabilidade da plataforma Chef de Despensa: a) indicar as
                características do serviço ou produto; b) os defeitos e vícios
                encontrados no serviço ou produto oferecido desde que lhe tenha
                dado causa; c) as informações que foram por ele divulgadas,
                sendo que os comentários ou informações divulgadas por usuários
                são de inteira responsabilidade dos próprios usuários; d) os
                conteúdos ou atividades ilícitas praticadas através da sua
                plataforma. A plataforma não se responsabiliza por links
                externos contidos em seu sistema que possam redirecionar o
                usuário à ambiente externo a sua rede. Não poderão ser incluídos
                links externos ou páginas que sirvam para fins comerciais ou
                publicitários ou quaisquer informações ilícitas, violentas,
                polêmicas, pornográficas, xenofóbicas, discriminatórias ou
                ofensivas.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                8. Dos direitos autorais O presente Termo de Uso concede aos
                usuários uma licença não exclusiva, não transferível e não
                sublicenciável, para acessar e fazer uso da plataforma e dos
                serviços e produtos por ela disponibilizados. A estrutura do
                site ou aplicativo, as marcas, logotipos, nomes comerciais,
                layouts, gráficos e design de interface, imagens, ilustrações,
                fotografias, apresentações, vídeos, conteúdos escritos e de som
                e áudio, programas de computador, banco de dados, arquivos de
                transmissão e quaisquer outras informações e direitos de
                propriedade intelectual da razão social RevenuesCook Chef S.A,
                observados os termos da Lei da Propriedade Industrial (Lei nº
                9.279/96), Lei de Direitos Autorais (Lei nº 9.610/98) e Lei do
                Software (Lei nº 9.609/98), estão devidamente reservados. Este
                Termos de Uso não cede ou transfere ao usuário qualquer direito,
                de modo que o acesso não gera qualquer direito de propriedade
                intelectual ao usuário, exceto pela licença limitada ora
                concedida. O uso da plataforma pelo usuário é pessoal,
                individual e intransferível, sendo vedado qualquer uso não
                autorizado, comercial ou não-comercial. Tais usos consistirão em
                violação dos direitos de propriedade intelectual da razão social
                RevenuesCook Chef S.A puníveis nos termos da legislação
                aplicável.{' '}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: 'justify',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {' '}
                9. Das sanções Sem prejuízo das demais medidas legais cabíveis,
                a razão social Chef de Despensa poderá, a qualquer momento,
                advertir, suspender ou cancelar a conta do usuário: a) que
                violar qualquer dispositivo do presente Termo; b) que descumprir
                os seus deveres de usuário; c) que tiver qualquer comportamento
                fraudulento, doloso ou que ofenda a terceiros.{' '}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.fecharModal}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'white'
  },
  inputContainer: {
    width: '80%',
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
  },
  button: {
    backgroundColor: '#FE0000',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  termos: {
    padding: 2,
    marginTop: 10,
  },
  termoscard: {
    padding: 2,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#FE0000',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  fecharModal: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FE0000', // Cor para o link de fechar o modal
  },
  underText: {
    color: 'black',
    fontSize: 14,
    marginTop: 1,
    marginBottom:10,
    fontFamily: 'Exo_Regular',
    alignSelf: 'center',
  },
  disabledButton: {
    backgroundColor: '#999999', // Altere a cor para indicar que o botão está desativado
  },
  underText2: {
    color: 'black',
    fontSize: 14,
    marginTop: 1,
    marginBottom:10,
    alignSelf: 'center',
  },
  loginText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  logo: {
    alignSelf: 'center',
    margin: 30,
    width: 110,
    height: 110,
  },
  checkbox: {
    margin: 8,
  },
});

export default RegisterScreen;
