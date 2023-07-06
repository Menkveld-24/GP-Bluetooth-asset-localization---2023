<template>
    <div class="h-screen relative">
        <div class="h-1/6 md:h-1/4"></div>
        <div class="text-right text-white max-w-none md:max-w-5xl">
            <div class="w-fit md:ml-auto ml-2">
                <div class="text-6xl md:text-8xl">Unimatrix 52</div>
                <div class="text-left">A Bluetooth asset localization system</div>
                <router-link :to="{ name: 'Live' }">
                    <div
                        class="hover:bg-sky-700 hover:cursor-pointer text-left bg-sky-800 w-1/6 rounded-md py-1 px-2 shadow-md text-sm hover:w-full transform transition-all duration-500 min-w-fit"
                    >
                        Dashboard
                    </div>
                </router-link>
            </div>
        </div>
        <div class="absolute bottom-0 right-0 flex text-sky-950 text-xs mb-1">
            <div class="py-1 px-2 my-auto">
                @2023 By Menke Veerman as a Graduation Project at the University of Twente
            </div>
            <a
                href="https://github.com/Menkveld-24/GP-Bluetooth-asset-localization---2023"
                target="_blank"
                class="ml-4 flex hover:bg-sky-800/40 rounded-sm py-1 px-2 duration-200 min-w-fit"
            >
                <GitHub class="h-4 my-auto" />Github
            </a>
        </div>
    </div>
</template>
