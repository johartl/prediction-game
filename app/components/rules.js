export default {
    template: `
    <div class="ui container rules-component">
        <h1>Rules</h1>
        <h3>Match predictions</h3>
        <table class="ui definition large table">
            <thead>
                <tr>
                    <th></th>
                    <th>Tendency</th>
                    <th>Goal difference</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Win</td>
                    <td><strong>1</strong> point</td>
                    <td><strong>2</strong> points</td>
                    <td><strong>4</strong> points</td>
                </tr>
                <tr>
                    <td>Draw</td>
                    <td><strong>1</strong> point</td>
                    <td>-</td>
                    <td><strong>4</strong> points</td>
                </tr>
            </tbody>
        </table>

        <h3>Special predictions</h3>
        <div class="ui large list">
            <div class="item">
                <i class="right triangle icon"></i>
                <div class="content">
                    <div class="header">World champion prediction</div>
                    <div class="description">Predicting the winner of the world championship will be rewarded <strong>10 points</strong>.</div>
                </div>
            </div>
        </div>

        <h3>General conditions</h3>
        <div class="ui large list">
            <div class="item">
                <i class="right triangle icon"></i>
                <div class="content">
                    <div class="header">Prediction mode</div>
                    <div class="description">Predicting the exact result after <strong>90 minutes</strong> (+ stoppage time).</div>
                </div>
            </div>
          
            <div class="item">
                <i class="right triangle icon"></i>
                <div class="content">
                    <div class="header">Visibility of predictions</div>
                    <div class="description">The predictions of other players for will be made visible <strong>after the match has started</strong>.</div>
                </div>
            </div>
            
            <div class="item">
                <i class="right triangle icon"></i>
                <div class="content">
                    <div class="header">Prediction deadlines</div>
                    <div class="description">Predictions can be submitted and changed <strong>until the beginning of the match</strong>.</div>
                </div>
            </div>
            
            <div class="item">
                <i class="right triangle icon"></i>
                <div class="content">
                    <div class="header">Tied on points</div>
                    <div class="description">The rankings of several players who are tied in total points are decided by counting the number of <strong>correctly predicted matches</strong>.</div>
                </div>
            </div>
        </div>
    </div>
    `
};
