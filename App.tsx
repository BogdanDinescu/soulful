import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import Account from './Account';
import Auth from './Auth';
import Home from './Home';
import Profile from './Profile';
import 'react-native-url-polyfill/auto';

export default function App() {
  const Stack = createNativeStackNavigator()

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
          <Stack.Screen name="Home" component={Home}/>
          <Stack.Screen name="Account" component={Account}/>
          <Stack.Screen name="Auth" component={Auth}/>
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
