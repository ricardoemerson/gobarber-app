import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Feather';

import api from '../../services/api';

import {
  Container, Header, BackButton, HeaderTitle, UserAvatar, ProviderList, ProviderListContainer,
  ProviderContainer, ProviderAvatar, ProviderName,
} from './styles';

import { useAuth } from '../../hooks/auth';
import { Provider } from '../Dashboard';

interface RouteParams {
  providerId: string;
}

const CreateAppointment: React.FC = () => {
  const route = useRoute();
  const routeParams = route.params as RouteParams;
  const { user } = useAuth();
  const { goBack } = useNavigation();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/providers');

      setProviders(data);
    })();
  }, []);

  const handleNavigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  return (
    <Container>
      <Header>
        <BackButton onPress={ handleNavigateBack }>
          <Icon name="chevron-left" size={ 24 } color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>

      <ProviderListContainer>
        <ProviderList
          horizontal
          showsHorizontalScrollIndicator={ false }
          data={ providers }
          keyExtractor={ provider => provider.id }
          renderItem={ ({ item: provider }) => (
            <ProviderContainer
              onPress={ () => handleSelectProvider(provider.id) }
              selected={ provider.id === selectedProvider }
            >
              <ProviderAvatar source={{ uri: provider.avatar_url }} />
              <ProviderName selected={ provider.id === selectedProvider }>{ provider.name }</ProviderName>
            </ProviderContainer>
          ) }
        />
      </ProviderListContainer>
    </Container>
  );
};

export default CreateAppointment;
