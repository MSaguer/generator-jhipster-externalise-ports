const chalk = require('chalk');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const jhipsterUtils = require('generator-jhipster/generators/utils');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            init(args) {
                if (args === 'default') {
                    // do something when argument is 'default'
                }
            },
            readConfig() {
                this.jhipsterAppConfig = this.getAllJhipsterConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Can\'t read .yo-rc.json');
                }
            },
            displayLogo() {

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster ExternalizePorts')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(`\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
                }
            },
            checkFramework() {
                const clientFramework = this.jhipsterAppConfig.clientFramework;
                if (clientFramework != 'angularX') {
                    this.error(`\nThis generator works only for angularX projects. Your project uses ${clientFramework} framework.\n`);
                }
            },
            checkBuildTool() {
                const buildTool = this.jhipsterAppConfig.buildTool;
                if (buildTool != 'maven') {
                    this.error(`\nThis generator works only for maven build tool. Your project uses ${buildTool} build tool.\n`);
                }
            }

        };
    }

    writing() {
        // function to use directly template
        this.template = function (source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        this.updateApplicationDevYml = function () {
            const applicationDevYml = `${jhipsterConstants.SERVER_MAIN_RES_DIR}config/application-dev.yml`;
            try {
                jhipsterUtils.replaceContent({
                    file: applicationDevYml,
                    pattern: /(port: 8080)/g,
                    regex: true,
                    content: 'port: #server.port#'
                }, this);
                jhipsterUtils.replaceContent({
                    file: applicationDevYml,
                    pattern: /(port: 25)/g,
                    regex: true,
                    content: 'port: #mail.port#'
                }, this);
                jhipsterUtils.replaceContent({
                    file: applicationDevYml,
                    pattern: /(port: 5000)/g,
                    regex: true,
                    content: 'port: #logging.logstash.port#'
                }, this);
                jhipsterUtils.replaceContent({
                    file: applicationDevYml,
                    pattern: /base-url: (http:\/\/127\.0\.0\.1:8080)\n/g,
                    regex: true,
                    content: 'base-url: http://127.0.0.1:#server.port#\n'
                }, this);
            } catch (e) {
                this.log(chalk.yellow('\nUnable to find ') + applicationDevYml + chalk.yellow(' is not updated\n'));
                this.debug('Error:', e);
            }
        };
        
        this.updateApplicationTestYml = function () {
            const applicationTestYml = `${jhipsterConstants.SERVER_TEST_RES_DIR}config/application.yml`;
            try {
                jhipsterUtils.replaceContent({
                    file: applicationTestYml,
                    pattern: /(port: 10344)/g,
                    regex: true,
                    content: 'port: #test.server.port#'
                }, this);
                jhipsterUtils.replaceContent({
                    file: applicationTestYml,
                    pattern: /(port: 5000)/g,
                    regex: true,
                    content: 'port: #logging.logstash.port#'
                }, this);
                jhipsterUtils.replaceContent({
                    file: applicationTestYml,
                    pattern: /base-url: (http:\/\/127\.0\.0\.1:8080)\n/g,
                    regex: true,
                    content: 'base-url: http://127.0.0.1:#server.port#\n'
                }, this);
            } catch (e) {
                this.log(chalk.yellow('\nUnable to find ') + applicationTestYml + chalk.yellow(' is not updated\n'));
                this.debug('Error:', e);
            }
        };

        this.updatePom = function () {
            const pomFile = 'pom.xml';
            let content = '$1';
            content += '$2    <execution>';
            content += '$2            <id>test-resources</id>';
            content += '$2            <phase>generate-test-resources</phase>';
            content += '$2            <goals>';
            content += '$2                <goal>copy-resources</goal>';
            content += '$2            </goals>';
            content += '$2            <configuration>';
            content += '$2                <outputDirectory>target/test-classes</outputDirectory>';
            content += '$2                <useDefaultDelimiters>false</useDefaultDelimiters>';
            content += '$2                <delimiters>';
            content += '$2                    <delimiter>#</delimiter>';
            content += '$2                </delimiters>';
            content += '$2                <resources>';
            content += '$2                    <resource>';
            content += '$2                        <directory>src/test/resources/</directory>';
            content += '$2                        <filtering>true</filtering>';
            content += '$2                        <includes>';
            content += '$2                            <include>config/*.yml</include>';
            content += '$2                        </includes>';
            content += '$2                    </resource>';
            content += '$2                    <resource>';
            content += '$2                        <directory>src/test/resources/</directory>';
            content += '$2                        <filtering>false</filtering>';
            content += '$2                        <excludes>';
            content += '$2                            <exclude>config/*.yml</exclude>';
            content += '$2                        </excludes>';
            content += '$2                    </resource>';
            content += '$2                </resources>';
            content += '$2            </configuration>';
            content += '$2        </execution>';
            content += '$2$3';
            try {
                jhipsterUtils.replaceContent({
                    file: pomFile,
                    pattern: /(<artifactId>maven-resources-plugin<\/artifactId>[\s\S]*?)(\s*)(<\/executions>)/m,
                    regex: true,
                    content
                }, this);
            } catch (e) {
                this.log(chalk.yellow('\nUnable to find ') + pomFile + chalk.yellow(' is not updated\n'));
                this.debug('Error:', e);
            }
        };

        this.updateApplicationTest = function () {
            this.template('mail/testEmail.html', `${jhipsterConstants.SERVER_TEST_RES_DIR}templates/mail/testEmail.html`);
            const testMail = `${jhipsterConstants.SERVER_TEST_SRC_DIR}${this.packageFolder}/service/MailServiceIntTest.java`;
            try {
                jhipsterUtils.replaceContent({
                    file: testMail,
                    pattern: /, http:\/\/127\.0\.0\.1:8080,/g,
                    regex: true,
                    content: ','
                }, this);
            } catch (e) {
                this.log(chalk.yellow('\nUnable to find ') + testMail + chalk.yellow(' is not updated\n'));
                this.debug('Error:', e);
            }
        };

        this.packageFolder = this.jhipsterAppConfig.packageFolder;

        this.updateApplicationDevYml();
        this.updateApplicationTestYml();
        this.updatePom();
        this.template('settings.exml', 'settings.xml');
        this.updateApplicationTest();

    }

    end() {
        this.log('End of ExternalizePorts generator');
    }
};
