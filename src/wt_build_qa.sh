for CN in ${ClientName//,/ }; do
	
    echo $CN 'on' ${ENVIRONMENT} | boxes
	if [ ${ENVIRONMENT} = "QA" ]
        then
        cd ${WORKSPACE}/development
    fi
    
    rm -rf dist #node_modules
    aws s3 cp s3://wt-stage-docker/QA/whale/assets/images/ src/assets/images/ --exclude "*" --include "*.png" --recursive
  	aws s3 cp s3://wt-stage-docker/QA/whale/assets/images/ src/assets/images/ --exclude "*" --include "*.ico" --recursive
    aws s3 cp s3://wt-stage-docker/QA/whale/assets/images/ src/assets/images/ --exclude "*" --include "*.svg" --recursive
    aws s3 cp s3://wt-stage-docker/QA/whale/assets/icons/ src/assets/icons/ --exclude "*" --include "*.png" --recursive
   	aws s3 cp s3://wt-stage-docker/QA/whale/config/ src/config/ --exclude "*" --include "*.ts" --recursive
	aws s3 cp s3://wt-stage-docker/QA/whale/config/ src/ --exclude "*" --include "manifest.json" --recursive    
	if [ ${ENVIRONMENT} = "QA" ]
        then
        pwd
        mv -f src/environments/wt.qa.enviroment.ts src/environments/wt.environment.ts
    fi

   	npm install
    
    if [ ${ENVIRONMENT} = "QA" ]
        then
		ng build --prod
		cd dist
        mkdir scripts
        cp /opt/jenkins_workspace/workspace/New-WT-BUILD-HK/resources/.htaccess .
        cp /opt/jenkins_workspace/workspace/NEW-WT-BUILD-QA/appspec.yml-whale-Production appspec.yml
        cp /opt/jenkins_workspace/workspace/NEW-WT-BUILD-QA/postdeploy.sh-whale-Production scripts/postdeploy.sh
        tar -cvzf ${CN}-${ENVIRONMENT}-${VERSION}.tar.gz * .htaccess
    fi
    aws s3 mv ${CN}-${ENVIRONMENT}-${VERSION}.tar.gz s3://webtrader-prod-build/ --region=ap-northeast-2
done
