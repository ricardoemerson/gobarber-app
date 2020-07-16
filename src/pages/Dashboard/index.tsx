import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState, useEffect } from 'react';
import { Button } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import api from '../../services/api';

import {
  Container, Header, HeaderTitle, UserName, ProfileButton, UserAvatar,
  ProviderList, ProviderListTitle, ProviderContainer, ProviderAvatar, ProviderInfo, ProviderName, ProviderMeta, ProviderMetaText,
} from './styles';

import { useAuth } from '../../hooks/auth';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);

  const { signOut, user } = useAuth();
  const { navigate } = useNavigation();

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/providers');

      setProviders(data);
    })();
  }, []);

  const handleNavigateToProfile = useCallback(() => {
    navigate('Profile');
  }, [navigate]);

  const handleNavigateToCreateAppointment = useCallback((providerId: string) => {
    navigate('CreateAppointment', { providerId });
  }, [navigate]);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Bem-vindo, { '\n' }
          <UserName>{ user.name }</UserName>
        </HeaderTitle>

        <ProfileButton onPress={ handleNavigateToProfile }>
          <UserAvatar source={{ uri: user.avatar_url }} />
        </ProfileButton>
      </Header>

      <ProviderList
        data={ providers }
        keyExtractor={ provider => provider.id }
        ListHeaderComponent={
          <ProviderListTitle>Cabeleireiros</ProviderListTitle>
        }
        renderItem={ ({ item: provider }) => (
          <ProviderContainer onPress={ () => handleNavigateToCreateAppointment(provider.id) }>
            <ProviderAvatar source={{ uri: provider.avatar_url || `https://api.adorable.io/avatars/72/${ provider.name }.png` }} />

            <ProviderInfo>
              <ProviderName>{ provider.name }</ProviderName>

              <ProviderMeta>
                <Icon name="calendar" size={ 14 } color="#ff9000" />
                <ProviderMetaText>Segunda à sexta</ProviderMetaText>
              </ProviderMeta>

              <ProviderMeta>
                <Icon name="clock" size={ 14 } color="#ff9000" />
                <ProviderMetaText>8h à 18h</ProviderMetaText>
              </ProviderMeta>
            </ProviderInfo>
          </ProviderContainer>
        ) }
      />

      <Button title="Sair" onPress={ signOut } />
    </Container>
  );
};

export default Dashboard;
