@echo off
echo Creating icon directories...
mkdir assets\icons\16x16
mkdir assets\icons\32x32
mkdir assets\icons\48x48
mkdir assets\icons\64x64
mkdir assets\icons\128x128
mkdir assets\icons\256x256
mkdir assets\icons\512x512

echo Converting SVG to PNG files...
:: هنا يجب استخدام أداة مثل ImageMagick للتحويل
:: تأكد من تثبيت ImageMagick أولاً

magick convert -resize 16x16 assets\app-icon.svg assets\icons\16x16\icon.png
magick convert -resize 32x32 assets\app-icon.svg assets\icons\32x32\icon.png
magick convert -resize 48x48 assets\app-icon.svg assets\icons\48x48\icon.png
magick convert -resize 64x64 assets\app-icon.svg assets\icons\64x64\icon.png
magick convert -resize 128x128 assets\app-icon.svg assets\icons\128x128\icon.png
magick convert -resize 256x256 assets\app-icon.svg assets\icons\256x256\icon.png
magick convert -resize 512x512 assets\app-icon.svg assets\icons\512x512\icon.png

echo Creating Windows ICO file...
magick convert assets\icons\16x16\icon.png assets\icons\32x32\icon.png assets\icons\48x48\icon.png assets\icons\64x64\icon.png assets\icons\128x128\icon.png assets\icons\256x256\icon.png assets\icon.ico

echo Creating macOS ICNS file...
:: بالنسبة لنظام Mac تحتاج إلى استخدام أداة أخرى، او تثبيت إضافات لـ ImageMagick

echo Done!