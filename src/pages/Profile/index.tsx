import { useNavigation } from '@react-navigation/native';
import React, { useRef, useCallback } from 'react';
import {
  View, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert, PermissionsAndroid,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';

import api from '../../services/api';

import Button from '../../components/Button';
import Input from '../../components/Input';

import {
  Container, BackButton, Title, UserAvatarButton, UserAvatar,
} from './styles';

import { useAuth } from '../../hooks/auth';
import getValidationErrors from '../../utils/getValidationErrors';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const passwordConfirmationInputRef = useRef<TextInput>(null);

  const handleGoBack = useCallback(async () => {
    navigation.goBack();
  }, [navigation]);

  const handleSubmit = useCallback(async (formData: ProfileFormData) => {
    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string().required('Nome obrigatório'),
        email: Yup.string().required('E-mail obrigatório').email('Informe um e-mail válido'),
        old_password: Yup.string(),
        password: Yup.string().when('old_password', {
          is: val => !!val.length,
          then: Yup.string().required(('Campo obrigatório')),
          otherwise: Yup.string(),
        }),
        password_confirmation: Yup.string().when('old_password', {
          is: val => !!val.length,
          then: Yup.string().required(('Campo obrigatório')),
          otherwise: Yup.string(),
        }).oneOf([Yup.ref('password'), null], 'Confirmação incorreta'),
      });

      await schema.validate(formData, { abortEarly: false });

      const {
        name, email, old_password, password, password_confirmation,
      } = formData;

      const userProfile = {
        name,
        email,
        ...(old_password ? { old_password, password, password_confirmation } : {}),
      };

      const { data } = await api.put('/profile', userProfile);

      updateUser(data);

      Alert.alert(
        'Perfil atualizado com sucesso!',
      );

      navigation.goBack();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);

        return;
      }

      Alert.alert(
        'Erro na atualização do perfil',
        'Ocorreu um erro ao atualizar o seu perfil, tente novamente.',
      );
    }
  }, [navigation, updateUser]);

  const handleUpdateAvatar = useCallback(async () => {
    ImagePicker.showImagePicker({
      title: 'Selecione um avatar',
      cancelButtonTitle: 'Cancelar',
      takePhotoButtonTitle: 'Usar Câmera',
      chooseFromLibraryButtonTitle: 'Escolha da Galeria',
      cameraType: 'front',
      quality: 0.7,
      mediaType: 'photo',
      storageOptions: {
        skipBackup: true,
        path: 'Pictures/myAppPicture/', // -->this is neccesary
        privateDirectory: true,
      },
    }, async response => {
      if (response.didCancel) {
        return;
      }

      if (response.error) {
        Alert.alert('Erro ao atualizar seu avatar.');
        return;
      }

      console.log('response.uri: ', response.uri);
      const formData = new FormData();

      formData.append('avatar', {
        type: 'image/jpeg',
        name: `${ user.id }.jpg`,
        uri: response.uri,
      });

      const { data } = await api.patch('/users/avatar', formData);

      updateUser(data);
    });
  }, [updateUser, user.id]);

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
          <BackButton onPress={ handleGoBack }>
            <Icon name="chevron-left" size={ 24 } color="#999591" />
          </BackButton>

          <UserAvatarButton onPress={ handleUpdateAvatar }>
            <UserAvatar source={{ uri: user.avatar_url }} />
          </UserAvatarButton>

          <View>
            <Title>Meu Perfil</Title>
          </View>

          <Form ref={ formRef } initialData={ user } onSubmit={ handleSubmit } style={{ width: '100%' }}>
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
              onSubmitEditing={ () => oldPasswordInputRef.current?.focus() }
            />

            <Input
              ref={ oldPasswordInputRef }
              name="old_password"
              icon="lock"
              placeholder="Senha atual"
              textContentType="newPassword"
              returnKeyType="next"
              containerStyle={{ marginTop: 16 }}
              onSubmitEditing={ () => passwordInputRef.current?.focus() }
              secureTextEntry
            />

            <Input
              ref={ passwordInputRef }
              name="password"
              icon="lock"
              placeholder="Nova senha"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={ () => passwordConfirmationInputRef.current?.focus() }
              secureTextEntry
            />

            <Input
              ref={ passwordConfirmationInputRef }
              name="password_confirmation"
              icon="lock"
              placeholder="Confirmar senha"
              textContentType="newPassword"
              returnKeyType="send"
              onSubmitEditing={ () => formRef.current?.submitForm() }
              secureTextEntry
            />

            <Button onPress={ () => formRef.current?.submitForm() }>Confirmar Mudanças</Button>
          </Form>

        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Profile;
