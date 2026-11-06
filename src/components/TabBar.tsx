import { ComponentProps, ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather, Octicons } from '@expo/vector-icons';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

type IconProps = { color: string };

const icons: Record<string, (props: IconProps) => ReactNode> = {
    '(home)': (props) => <Feather name="grid" size={30} {...props} />,
    FoodList: (props) => <Octicons name="three-bars" size={30} {...props} />,
    AddNew: (props) => <Feather name="plus" size={30} style={styles.addNew} />,
    Notifications: (props) => <Feather name="bell" size={30} {...props} />,
    '(profile)': (props) => <Feather name="user" size={30} {...props} />,
};

const TabBar = ({ state, descriptors }: TabBarProps) => {
    return (
        <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
                if (['_sitemap', '+not-found'].includes(route.name)) return null;

                const { options, navigation } = descriptors[route.key];

                const isFocused = state.index === index;
                const color = isFocused ? '#FF7622' : '#AFAFAF';
                const renderIcon = icons[route.name];

                const onPress = () => {
                    if (!isFocused) {
                        navigation.navigate(route.name, route.params);
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
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 36,
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
        height: 64,
    },
    addNew: {
        backgroundColor: '#FFF1F2',
        width: 57,
        height: 57,
        borderRadius: 100,
        borderColor: '#FF7622',
        borderWidth: 1,
        color: '#FF7622',
        padding: 12,
    },
});

export default TabBar;