if [ $(npm whoami) != 'lordfriend' ]; then
    echo 'use invalid'
    exit 1;
fi
echo 'user valid, run test'
# unit test
npm test

# build release
echo 'build release'
$(npm bin)/gulp build

# cp files
echo 'copy files'
cp package.json ./dist/
cp .npmignore ./dist/
cp LICENSE ./dist/
cp README.md ./dist/

echo 'publish...'
# publish
cd ./dist
npm publish --access public
