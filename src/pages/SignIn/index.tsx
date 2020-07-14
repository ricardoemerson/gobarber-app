import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import {
  View, Image, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';

import Button from '../../components/Button';
import Input from '../../components/Input';

import {
  Container, Title, ForgotPasswordButton, ForgotPasswordText, CreateAccountButton, CreateAccountText,
} from './styles';

import logoImg from '../../assets/logo.png';
import { useAuth } from '../../hooks/auth';
import getValidationErrors from '../../utils/getValidationErrors';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const { signIn } = useAuth();

  const handleSubmit = useCallback(async (data: SignInFormData) => {
    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        email: Yup.string().required('E-mail obrigatório').email('Informe um e-mail válido'),
        password: Yup.string().required('Senha obrigatória'),
      });

      await schema.validate(data, { abortEarly: false });

      await signIn({
        email: data.email,
        password: data.password,
      });

      Alert.alert(
        'Logon realizado',
        'Você foi autenticado com sucesso!',
      );
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);

        return;
      }

      Alert.alert(
        'Erro na autenticação',
        'Ocorreu um erro ao fazer login, verifique as suas credenciais.',
      );
    }
  }, [signIn]);

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
            <Title>Faça seu logon</Title>
          </View>

          <Form ref={ formRef } onSubmit={ handleSubmit } style={{ width: '100%' }}>
            <Input
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
              secureTextEntry
              returnKeyType="send"
              onSubmitEditing={ () => formRef.current?.submitForm() }
            />

            <Button onPress={ () => formRef.current?.submitForm() }>Entrar</Button>
          </Form>

          <ForgotPasswordButton onPress={ () => { console.log('forgotPassword'); } }>
            <ForgotPasswordText>Esqueci minha senha</ForgotPasswordText>
          </ForgotPasswordButton>
        </Container>

        <CreateAccountButton onPress={ () => navigation.navigate('SignUp') }>
          <Icon name="log-in" size={ 20 } color="#ff9000" />
          <CreateAccountText>Criar uma conta</CreateAccountText>
        </CreateAccountButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
