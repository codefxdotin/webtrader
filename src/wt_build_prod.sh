for CN in ${ClientName//,/ }; do
    
	echo $CN 'on' ${ENVIRONMENT} | boxes
    if [ ${CN} = "gdex" ] 
        then
        cd ${WORKSPACE}/angular-cli-GDEX
    elif [ ${CN} = "whale-redbat" ]
        then
        cd ${WORKSPACE}/angular-cli-whale-redbat
    elif [ ${CN} = "countdown" ] || [ ${CN} = "bomex" ] || [ ${CN} = "ttm" ] || [ ${CN} = "fxoak" ]  || [ ${CN} = "whale" ]  || [ ${CN} = "microfox" ]  || [ ${CN} = "vietnam" ]
        then
		#cd ${WORKSPACE}/angular-cli-whale
		cd ${WORKSPACE}/master
	elif [ ${CN} = "ultra" ]
        then
        cd ${WORKSPACE}/angular-cli-Ultra
    elif [ ${CN} = "demo" ]
        then
        cd ${WORKSPACE}/angular-cli-GDEX
    else
		cd ${WORKSPACE}/angular-cli-migration
    fi
    
    rm -rf dist #node_modules
    aws s3 cp s3://wt-stage-docker/${ENVIRONMENT}/${CN}/assets/images/ src/assets/images/ --exclude "*" --include "*.png" --recursive
  	aws s3 cp s3://wt-stage-docker/${ENVIRONMENT}/${CN}/assets/images/ src/assets/images/ --exclude "*" --include "*.ico" --recursive
    aws s3 cp s3://wt-stage-docker/${ENVIRONMENT}/${CN}/assets/images/ src/assets/images/ --exclude "*" --include "*.svg" --recursive
    aws s3 cp s3://wt-stage-docker/${ENVIRONMENT}/${CN}/assets/icons/ src/assets/icons/ --exclude "*" --include "*.png" --recursive
   	aws s3 cp s3://wt-stage-docker/${ENVIRONMENT}/${CN}/config/ src/config/ --exclude "*" --include "*.ts" --recursive
    aws s3 cp s3://wt-stage-docker/${ENVIRONMENT}/${CN}/config/ src/ --exclude "*" --include "manifest.json" --recursive
    
	if [ ${CN} = "microfox" ]
		then
		mv -f src/environments/wt.microfox.enviroment.ts src/environments/wt.environment.ts
	elif [ ${CN} = "whale" ]
		then
		mv -f src/environments/wt.whale.enviroment.ts src/environments/wt.environment.ts
	elif [ ${CN} = "fxoak" ]
		then
		mv -f src/environments/wt.fxoak.enviroment.ts src/environments/wt.environment.ts
	elif [ ${CN} = "vietnam" ]
		then
		mv -f src/environments/wt.vietnam.enviroment.ts src/environments/wt.environment.ts
	elif [ ${CN} = "ultra" ]
		then
		mv -f src/environments/wt.ultra.enviroment.ts src/environments/wt.environment.ts
	elif [ ${CN} = "bomex" ]
		then
		mv -f src/environments/wt.bomex.enviroment.ts src/environments/wt.environment.ts
	fi
	
   	npm install
    
    if [ ${ENVIRONMENT} = "Production" ] 
        then
        if [ ${CN} = "gdex" ] || [ ${CN} = "kingsmen" ] || [ ${CN} = "sky9fx" ] || [ ${CN} = "microfox" ]  || [ ${CN} = "demo" ]  || [ ${CN} = "fxmiso" ]  || [ ${CN} = "ttm" ]  || [ ${CN} = "whale" ] || [ ${CN} = "fxoak" ] || [ ${CN} = "ruoxuan" ] || [ ${CN} = "vietnam" ]  || [ ${CN} = "singleAPI" ] || [ ${CN} = "ultra" ] || [ ${CN} = "bomex" ]
        then
        	ng build --prod
        elif [ ${CN} = "whale-redbat" ]
        then
            ng build --prod --base-href=/countdown-bonus/ --deploy-url /countdown-bonus/
    	else
            ng build --prod --base-href=/wt/ --deploy-url /wt/
        fi
    fi    
    
    cd dist
    if [ ${ENVIRONMENT} = "Production" ]
        then
        mkdir scripts
        cp ${WORKSPACE}/resources/.htaccess .
        cp ${WORKSPACE}/appspecs/appspec.yml-${CN}-${ENVIRONMENT} appspec.yml
        cp ${WORKSPACE}/scripts/postdeploy.sh-${CN}-${ENVIRONMENT} scripts/postdeploy.sh
        tar -cvzf ${CN}-${ENVIRONMENT}-${VERSION}.tar.gz * .htaccess  
    fi
    aws s3 mv ${CN}-${ENVIRONMENT}-${VERSION}.tar.gz s3://bbv2-build-hongkong/ --region=ap-east-1
done
