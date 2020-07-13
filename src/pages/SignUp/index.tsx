import { useNavigation } from '@react-navigation/native';
import React, { useRef, useCallback } from 'react';
import {
  View, Image, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';

import api from '../../services/api';

import Button from '../../components/Button';
import Input from '../../components/Input';

import { Container, Title, BackToSignInButton, BackToSignInText } from './styles';

import logoImg from '../../assets/logo.png';
import getValidationErrors from '../../utils/getValidationErrors';

interface SignUpFormaData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(async (data: SignUpFormaData) => {
    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string().required('Nome obrigatório'),
        email: Yup.string().required('E-mail obrigatório').email('Informe um e-mail válido'),
        password: Yup.string().min(6, 'No mínimo 6 caracteres'),
      });

      await schema.validate(data, { abortEarly: false });

      await api.post('/users', data);

      Alert.alert(
        'Cadastro realizado',
        'Você já pode efetuar o seu logon no GoBarber!',
      );

      navigation.goBack();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);

        return;
      }

      Alert.alert(
        'Erro no cadastro',
        'Ocorreu um erro ao fazer o seu cadastro, tente novamente.',
      );
    }
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={ Platform.OS === 'ios' ? 'padding' : undefined }
      enabled
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        <Container>
          <Image source={ logoImg } />

          <View>
            <Title>Crie sua conta</Title>
          </View>

          <Form ref={ formRef } onSubmit={ handleSubmit }>
            <Input
              autoCapitalize="words"
              name="name"
              icon="user"
              placeholder="Nome"
              returnKeyType="next"
              onSubmitEditing={ () => emailInputRef.current?.focus() }
            />

            <Input
              ref={ emailInputRef }
              autoCorrect={ false }
              autoCapitalize="none"
              keyboardType="email-address"
              name="email"
              icon="mail"
              placeholder="E-mail"
              returnKeyType="next"
              onSubmitEditing={ () => passwordInputRef.current?.focus() }
            />

            <Input
              ref={ passwordInputRef }
              name="password"
              icon="lock"
              placeholder="Senha"
              textContentType="newPassword"
              returnKeyType="send"
              onSubmitEditing={ () => formRef.current?.submitForm() }
              secureTextEntry
            />

            <Button onPress={ () => formRef.current?.submitForm() }>Criar</Button>
          </Form>
        </Container>

        <BackToSignInButton onPress={ () => navigation.goBack() }>
          <Icon name="arrow-left" size={ 20 } color="#fff" />
          <BackToSignInText>Voltar para logon</BackToSignInText>
        </BackToSignInButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
