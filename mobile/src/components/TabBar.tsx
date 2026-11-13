import { ComponentProps, ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Feather, Octicons } from '@expo/vector-icons';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

type IconProps = { color: string };

const hiddenOnTabs = ['AddNew'];
const hiddenOnScreens = ['ChefFoodDetails', 'SucessfulWithdraw', 'Reviews', 'Profile', 'Adresses', 'AddAddress'];

const icons: Record<string, (props: IconProps) => ReactNode> = {
    '(home)': (props) => <Feather name="grid" size={30} {...props} />,
    FoodList: (props) => <Octicons name="three-bars" size={30} {...props} />,
    AddNew: () => (
        <View style={styles.addNew}>
            <Feather name="plus" size={30} color="#FF7622" />
        </View>
    ),
    Notifications: (props) => <Feather name="bell" size={30} {...props} />,
    '(profile)': (props) => <Feather name="user" size={30} {...props} />,
};

const TabBar = ({ state, descriptors }: TabBarProps) => {
    const focusedRoute = state.routes[state.index];
    const nestedRouteName = getFocusedRouteNameFromRoute(focusedRoute);

    if (hiddenOnTabs.includes(focusedRoute.name)) {
        return null;
    }

    if (nestedRouteName && hiddenOnScreens.includes(nestedRouteName)) {
        return null;
    }

    return (
        <View style={[styles.tabBar, { paddingBottom: 16 }]}>
            {state.routes.map((route, index) => {
                if (['_sitemap', '+not-found'].includes(route.name)) return null;

                const { options, navigation } = descriptors[route.key];

                const isFocused = state.index === index;
                const color = isFocused ? '#FF7622' : '#AFAFAF';
                const renderIcon = icons[route.name];

                const onPress = () => {
                    if (isFocused) return;
                    if (route.name === '(profile)') {
                        navigation.navigate(route.name, { screen: 'Profile' });
                    } else {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        style={styles.tabBarItem}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarButtonTestID}
                        onPress={onPress}
                    >
                        {renderIcon ? renderIcon({ color }) : null}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingTop: 16,
        borderRadius: 36,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 20,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.0,
        elevation: 24,
    },
    tabBarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
    },
    addNew: {
        backgroundColor: '#FFF1F2',
        width: 57,
        height: 57,
        borderRadius: 100,
        borderColor: '#FF7622',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TabBar;