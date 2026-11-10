import { Pressable, Text, View } from "react-native";

type ServiceCardProps = {
    icon: string;
    title: string;
    onPress: () => void;
}

export function ServiceCard({ icon, title, onPress }: ServiceCardProps){
    return (
        <Pressable 
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={title}
            className="mb-[7px] h-[60px] w-[23.4%] items-center justify-center rounded-[9px] border border-[#D6EAD9] bg-white">
            
            <View className="h-[27px] w-[27px] items-center justify-center rounded-lg bg-[#D9F2DF]">
                <Text className="text-[13px]">{icon}</Text>
            </View>

            <Text className="mt-[5px] text-[9px] font-semibold text-[#183D2E]">{title}</Text>

        </Pressable>
    );
}