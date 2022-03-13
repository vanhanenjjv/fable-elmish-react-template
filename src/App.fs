module App.View

open Fable.React.Standard
open Fable.Core.JsInterop

importAll "../sass/main.sass"

open Global

open App.Types
open App.State

let root model dispatch =
    let pageHtml page =
        match page with
        | Home -> Home.View.root model.Home (HomeMsg >> dispatch)

    div 
        []
        [ pageHtml model.CurrentPage ]

open Elmish.UrlParser
open Elmish
open Elmish.React
open Elmish.Debug
open Elmish.HMR

// App
Program.mkProgram init update root
|> Program.toNavigable (parseHash pageParser) urlUpdate
#if DEBUG
|> Program.withDebugger
#endif
|> Program.withReactBatched "app"
|> Program.run
