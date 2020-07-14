import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Button } from 'react-native';

import {
  Container, Header, HeaderTitle, UserName, ProfileButton, UserAvatar,
} from './styles';

import { useAuth } from '../../hooks/auth';

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();

  const handleNavigateToProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

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

      <Button title="Sair" onPress={ signOut } />
    </Container>
  );
};

export default Dashboard;
