if [ $(npm whoami) != 'lordfriend' ]; then
    echo 'use invalid'
    exit 1;
fi
echo 'user valid, copy files'
# cp files
cp package.json ./dist/
cp .npmignore ./dist/
cp LICENSE ./dist/
cp README.md ./dist/

echo 'publish...'
# publish
cd ./dist
npm publish --access public
