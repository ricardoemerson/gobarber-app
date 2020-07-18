import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { format } from 'date-fns';

import api from '../../services/api';

import {
  Container, Header, BackButton, HeaderTitle, UserAvatar, Content, ProviderList, ProviderListContainer,
  ProviderContainer, ProviderAvatar, ProviderName, Calendar, Title, OpenDatePickerButton,
  OpenDatePickerButtonText, Schedule, Section, SectionTitle, SectionContent, Hour, HourText,
} from './styles';

import { useAuth } from '../../hooks/auth';
import { Provider } from '../Dashboard';

interface RouteParams {
  providerId: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const route = useRoute();
  const routeParams = route.params as RouteParams;
  const { user } = useAuth();
  const { goBack } = useNavigation();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/providers');

      setProviders(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/providers/${ selectedProvider }/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      });

      console.log('data: ', data);
      setAvailability(data);
    })();
  }, [selectedDate, selectedProvider]);

  const handleNavigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker(state => !state);
  }, []);

  const handleDateChange = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleSelectHour = useCallback(async (hour: number) => {
    setSelectedHour(hour);
  }, []);

  const morningAvailability = useMemo(() => availability
    .filter(({ hour }) => hour < 12)
    .map(({ hour, available }) => ({
      hour,
      available,
      hourFormatted: format(new Date().setHours(hour), 'HH:00'),
    })), [availability]);

  const afternoonAvailability = useMemo(() => availability
    .filter(({ hour }) => hour >= 12)
    .map(({ hour, available }) => ({
      hour,
      available,
      hourFormatted: format(new Date().setHours(hour), 'HH:00'),
    })), [availability]);

  return (
    <Container>
      <Header>
        <BackButton onPress={ handleNavigateBack }>
          <Icon name="chevron-left" size={ 24 } color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>

      <Content>
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

        <Calendar>
          <Title>Escolha a data</Title>

          <OpenDatePickerButton onPress={ handleToggleDatePicker }>
            <OpenDatePickerButtonText>Selecionar outra data</OpenDatePickerButtonText>
          </OpenDatePickerButton>

          { showDatePicker && (
          <DateTimePicker
            mode="date"
            display="calendar"
            onChange={ handleDateChange }
            textColor="#f4ede8"
            value={ selectedDate }
          />
          ) }
        </Calendar>

        <Schedule>
          <Title>Escolha o horário</Title>

          <Section>
            <SectionTitle>Manhã</SectionTitle>

            <SectionContent>
              { morningAvailability.map(({ hour, hourFormatted, available }) => (
                <Hour
                  enabled={ available }
                  selected={ selectedHour === hour }
                  key={ hourFormatted }
                  available={ available }
                  onPress={ () => handleSelectHour(hour) }
                >
                  <HourText selected={ selectedHour === hour }>{ hourFormatted }</HourText>
                </Hour>
              )) }
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>

            <SectionContent>
              { afternoonAvailability.map(({ hour, hourFormatted, available }) => (
                <Hour
                  enabled={ available }
                  selected={ selectedHour === hour }
                  key={ hourFormatted }
                  available={ available }
                  onPress={ () => handleSelectHour(hour) }
                >
                  <HourText selected={ selectedHour === hour }>{ hourFormatted }</HourText>
                </Hour>
              )) }
            </SectionContent>
          </Section>
        </Schedule>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
