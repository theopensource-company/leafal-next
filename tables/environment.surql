DEFINE TABLE environment SCHEMAFULL PERMISSIONS
        FOR select WHERE $scope = 'admin' OR public = true
        FOR update WHERE $scope = 'admin'
        FOR create, delete NONE;

DEFINE FIELD value ON TABLE environment TYPE string;
DEFINE FIELD public ON TABLE environment TYPE bool;

IF not(environment:origin.id) THEN
        CREATE environment:origin SET value = "", public = true;
END;